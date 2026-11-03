import React, { useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, X } from 'lucide-react';
import { SubjectItem, SessionData } from '../types';
import { StorageService } from '../services/storageService';

interface SubjekViewProps {
  subjects: SubjectItem[];
  session: SessionData;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SubjekView: React.FC<SubjekViewProps> = ({
  subjects,
  session,
  onRefresh,
  onShowToast
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  const [formKod, setFormKod] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJam, setFormJam] = useState(5);

  const isAdminOrPk = session.role === 'admin' || session.role === 'pentadbir' || session.role === 'penyelaras';

  const openAdd = () => {
    setFormKod('');
    setFormNama('');
    setFormJam(5);
    setIsAddModalOpen(true);
  };

  const openEdit = (s: SubjectItem) => {
    setEditingSubject(s);
    setFormKod(s.kod);
    setFormNama(s.nama);
    setFormJam(s.jam_seminggu);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKod.trim() || !formNama.trim()) {
      onShowToast('Sila lengkapkan kod dan nama subjek.', 'error');
      return;
    }
    StorageService.addSubject({
      kod: formKod,
      nama: formNama,
      jam_seminggu: formJam
    });
    onShowToast('Subjek baru berjaya didaftarkan.', 'success');
    setIsAddModalOpen(false);
    onRefresh();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    StorageService.updateSubject(editingSubject.id, {
      kod: formKod,
      nama: formNama,
      jam_seminggu: formJam
    });
    onShowToast('Maklumat subjek berjaya dikemaskini.', 'success');
    setEditingSubject(null);
    onRefresh();
  };

  const handleDelete = (s: SubjectItem) => {
    if (window.confirm(`Adakah anda pasti mahu memadam subjek ${s.nama}?`)) {
      StorageService.deleteSubject(s.id);
      onShowToast(`Subjek ${s.nama} telah dipadam.`, 'info');
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
              PENGURUSAN SUBJEK
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Senarai Mata Pelajaran (2026)</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Daftar kod dan nama subjek bagi perancangan jadual waktu PdP.</p>
        </div>

        {isAdminOrPk && (
          <button
            onClick={openAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Subjek</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-emerald-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-100">
                {s.kod}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{s.nama}</h4>
                <span className="text-xs text-slate-500 font-medium">{s.jam_seminggu} Jam / Seminggu</span>
              </div>
            </div>

            {isAdminOrPk && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(s)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 flex items-center justify-center transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 flex items-center justify-center transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Subjek Baru</h3>
                  <p className="text-xs text-slate-500">Daftar mata pelajaran bagi jadual waktu</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kod</label>
                  <input
                    type="text"
                    required
                    placeholder="BM"
                    value={formKod}
                    onChange={(e) => setFormKod(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nama Subjek</label>
                  <input
                    type="text"
                    required
                    placeholder="Bahasa Melayu"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Jam Seminggu</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formJam}
                  onChange={(e) => setFormJam(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Simpan Subjek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kemaskini Subjek</h3>
                  <p className="text-xs text-slate-500">Ubah maklumat subjek {editingSubject.nama}</p>
                </div>
              </div>
              <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kod</label>
                  <input
                    type="text"
                    required
                    value={formKod}
                    onChange={(e) => setFormKod(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Nama Subjek</label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Jam Seminggu</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formJam}
                  onChange={(e) => setFormJam(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
                >
                  Kemaskini Subjek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
