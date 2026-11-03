import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cloud persistence data file
const DATA_FILE = path.join(process.cwd(), 'gtepat-cloud-db.json');

interface CloudData {
  attendance: any[];
  users: any[];
  classes: any[];
  subjects: any[];
  timetable: any[];
  settings: any;
  customLogo: string | null;
  lastUpdated: string;
}

function loadCloudData(): CloudData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading cloud data:', err);
  }
  return {
    attendance: [],
    users: [],
    classes: [],
    subjects: [],
    timetable: [],
    settings: null,
    customLogo: null,
    lastUpdated: new Date().toISOString()
  };
}

function saveCloudData(data: CloudData) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving cloud data:', err);
  }
}

// In-memory working cache
const stripTeacherTitle = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\b(ENCIK|PUAN|CIK)\b\s*/gi, '')
    .replace(/\b(PN|EN)\.?\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

let cloudCache: CloudData = loadCloudData();
// Ensure simulation records are completely purged and titles are standardized
cloudCache.attendance = (cloudCache.attendance || []).filter(r => {
  const id = String(r?.id || '');
  return !(/^rec_0[1-9]$/.test(id) || id === 'rec_10' || id === 'rec_1787717291228_916');
}).map(r => ({
  ...r,
  guru: stripTeacherTitle(r.guru)
}));

if (Array.isArray(cloudCache.classes)) {
  cloudCache.classes = cloudCache.classes.map(c => ({
    ...c,
    guru_kelas: stripTeacherTitle(c.guru_kelas),
    pembantu_guru_kelas: c.pembantu_guru_kelas ? stripTeacherTitle(c.pembantu_guru_kelas) : ''
  }));
}

if (cloudCache.settings) {
  if (cloudCache.settings.guru_besar) cloudCache.settings.guru_besar = stripTeacherTitle(cloudCache.settings.guru_besar);
  if (cloudCache.settings.pk_pentadbiran) cloudCache.settings.pk_pentadbiran = stripTeacherTitle(cloudCache.settings.pk_pentadbiran);
}

saveCloudData(cloudCache);

// -------------------------------------------------------------
// CLOUD API ENDPOINTS
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    server: 'G-TEPAT SK KEPAWA CLOUD SERVER 2026',
    timestamp: new Date().toISOString(),
    recordCount: cloudCache.attendance.length
  });
});

// Full Cloud Sync snapshot (Fetch current server data)
app.get('/api/sync', (req, res) => {
  res.json({
    success: true,
    data: cloudCache,
    serverTime: new Date().toISOString()
  });
});

// Bulk sync from client to cloud server
app.post('/api/sync', (req, res) => {
  try {
    const { attendance, users, classes, subjects, timetable, settings, customLogo } = req.body;
    
    if (Array.isArray(attendance)) {
      const isSim = (r: any) => {
        if (!r || !r.id) return true;
        const id = String(r.id);
        return /^rec_0[1-9]$/.test(id) || id === 'rec_10' || id === 'rec_1787717291228_916';
      };

      const validClient = attendance.filter(r => !isSim(r));
      const map = new Map();
      cloudCache.attendance.filter(r => !isSim(r)).forEach(r => map.set(r.id, r));
      validClient.forEach(r => map.set(r.id, r));
      cloudCache.attendance = Array.from(map.values()).sort((a, b) => {
        const dateA = `${a.tarikh} ${a.masa}`;
        const dateB = `${b.tarikh} ${b.masa}`;
        return dateB.localeCompare(dateA);
      });
    }

    if (Array.isArray(users) && users.length > 0) {
      cloudCache.users = users;
    }
    if (Array.isArray(classes) && classes.length > 0) {
      cloudCache.classes = classes;
    }
    if (Array.isArray(subjects) && subjects.length > 0) {
      cloudCache.subjects = subjects;
    }
    if (Array.isArray(timetable) && timetable.length > 0) {
      cloudCache.timetable = timetable;
    }
    if (settings) {
      cloudCache.settings = settings;
    }
    if (customLogo !== undefined) {
      cloudCache.customLogo = customLogo;
    }

    saveCloudData(cloudCache);

    res.json({
      success: true,
      message: 'Data awan berjaya diselaraskan.',
      data: cloudCache
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Attendance Records
app.get('/api/attendance', (req, res) => {
  res.json(cloudCache.attendance || []);
});

// Create Attendance Record
app.post('/api/attendance', (req, res) => {
  try {
    const newRecord = req.body;
    if (!newRecord.id) {
      newRecord.id = 'rec_cloud_' + Date.now();
    }
    if (!newRecord.tarikh) {
      newRecord.tarikh = new Date().toISOString().split('T')[0];
    }
    if (!newRecord.masa) {
      newRecord.masa = new Date().toLocaleTimeString('en-GB', { hour12: false });
    }
    if (newRecord.guru) {
      newRecord.guru = stripTeacherTitle(newRecord.guru);
    }

    // Add to cache & persist
    cloudCache.attendance = [newRecord, ...cloudCache.attendance.filter(r => r.id !== newRecord.id)];
    saveCloudData(cloudCache);

    res.status(201).json({ success: true, record: newRecord });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Attendance Record
app.put('/api/attendance/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = req.body;
    cloudCache.attendance = cloudCache.attendance.map(r => r.id === id ? { ...r, ...updated } : r);
    saveCloudData(cloudCache);
    res.json({ success: true, record: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Attendance Record
app.delete('/api/attendance/:id', (req, res) => {
  try {
    const { id } = req.params;
    cloudCache.attendance = cloudCache.attendance.filter(r => r.id !== id);
    saveCloudData(cloudCache);
    res.json({ success: true, message: 'Rekod telah dipadamkan dari pelayan awan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clean/Reset Test & Simulation Data (Clean Production Reset)
app.post('/api/attendance/clean-test-data', (req, res) => {
  try {
    // Keep only real live scans or clear test logs as requested
    cloudCache.attendance = [];
    saveCloudData(cloudCache);
    res.json({ 
      success: true, 
      message: 'Semua data log ujian/simulasi telah dibersihkan sepenuhnya untuk mod operasi pengeluaran sebenar.' 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
  res.json(cloudCache.settings || null);
});

app.post('/api/settings', (req, res) => {
  cloudCache.settings = req.body;
  saveCloudData(cloudCache);
  res.json({ success: true, settings: cloudCache.settings });
});

// Logo Endpoints
app.get('/api/logo', (req, res) => {
  res.json({ customLogo: cloudCache.customLogo });
});

app.post('/api/logo', (req, res) => {
  cloudCache.customLogo = req.body.customLogo || null;
  saveCloudData(cloudCache);
  res.json({ success: true, customLogo: cloudCache.customLogo });
});

// -------------------------------------------------------------
// VITE DEV & PROD STATIC SERVING
// -------------------------------------------------------------

async function start() {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const distPath = path.join(process.cwd(), 'dist');

    if (isProd && fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`G-TEPAT SK Kepawa Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Fatal error starting G-TEPAT server:', err);
    process.exit(1);
  }
}

start();
