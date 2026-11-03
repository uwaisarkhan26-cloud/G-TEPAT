import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';

interface SchoolLogoProps {
  className?: string;
  id?: string;
  forceDefault?: boolean;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = 'w-full h-full', 
  id = 'school-logo-svg',
  forceDefault = false 
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    if (forceDefault) return null;
    return typeof window !== 'undefined' ? StorageService.getCustomLogo() : null;
  });

  useEffect(() => {
    if (forceDefault) {
      setCustomLogo(null);
      return;
    }

    const updateLogo = () => {
      setCustomLogo(StorageService.getCustomLogo());
    };

    updateLogo();
    window.addEventListener('school-logo-updated', updateLogo);
    window.addEventListener('storage', updateLogo);
    return () => {
      window.removeEventListener('school-logo-updated', updateLogo);
      window.removeEventListener('storage', updateLogo);
    };
  }, [forceDefault]);

  if (customLogo && !forceDefault) {
    return (
      <img
        id={id}
        src={customLogo}
        alt="Logo Rasmi SK Kepawa"
        className={`${className} object-contain`}
        draggable={false}
      />
    );
  }

  return (
    <svg 
      id={id}
      viewBox="0 0 1000 1160" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      aria-label="Logo Rasmi SK Kepawa"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Curved Guide Path for Top Arch Text: SEK. KEB. KEPAWA */}
        <path 
          id="textPathSekKebKepawa" 
          d="M 125, 340 A 420, 390 0 0,1 875, 340" 
          fill="none" 
        />
      </defs>

      {/* 1. Main Outer Yellow Shield with Side Steps & Pointed Base */}
      <path
        d="M 82, 348 
           C 132, 60 415, 8 500, 8 
           C 585, 8 868, 60 918, 348 
           L 865, 372 
           L 832, 475 
           L 500, 835 
           L 168, 475 
           L 135, 372 
           Z"
        fill="#FFEA00"
        stroke="#000000"
        strokeWidth="18"
        strokeLinejoin="round"
      />

      {/* 2. Top Arch Text: SEK. KEB. KEPAWA */}
      <text 
        fontFamily="'Arial Black', 'Arial', 'Impact', sans-serif" 
        fontWeight="900" 
        fontSize="68" 
        fill="#000000" 
        letterSpacing="3px"
      >
        <textPath href="#textPathSekKebKepawa" startOffset="50%" textAnchor="middle">
          SEK. KEB. KEPAWA
        </textPath>
      </text>

      {/* 3. Green Semicircular Dome Under Arch */}
      <path
        d="M 188, 350 
           C 255, 155 410, 110 500, 110 
           C 590, 110 745, 155 812, 350 
           C 715, 305 595, 222 500, 222 
           C 405, 222 285, 305 188, 350 
           Z"
        fill="#00D228"
        stroke="#000000"
        strokeWidth="16"
        strokeLinejoin="round"
      />

      {/* 4. Central Red Canopy / Drapery with Fold Lines */}
      <g stroke="#000000" strokeWidth="15" strokeLinejoin="round">
        {/* Main Red Canopy Body */}
        <path
          d="M 500, 222 
             C 595, 222 715, 305 812, 350 
             L 695, 515 
             L 500, 835 
             L 305, 515 
             L 188, 350 
             C 285, 305 405, 222 500, 222 
             Z"
          fill="#E60000"
        />

        {/* Drapery Fold Crease Lines */}
        <line x1="500" y1="222" x2="500" y2="835" stroke="#000000" strokeWidth="14" />
        <line x1="290" y1="322" x2="500" y2="835" stroke="#000000" strokeWidth="11" />
        <line x1="710" y1="322" x2="500" y2="835" stroke="#000000" strokeWidth="11" />
        <line x1="400" y1="272" x2="500" y2="835" stroke="#000000" strokeWidth="9" opacity="0.9" />
        <line x1="600" y1="272" x2="500" y2="835" stroke="#000000" strokeWidth="9" opacity="0.9" />
      </g>

      {/* 5. Diploma Scroll (Gulungan Sijil) with Ribbon & Bow */}
      <g stroke="#000000" strokeLinejoin="round">
        {/* Scroll Cylinder Body */}
        <g strokeWidth="14" fill="#FFFFFF">
          {/* Main Tilted Scroll Cylinder */}
          <path
            d="M 378, 408 
               L 695, 350 
               C 710, 347 724, 362 708, 388 
               L 392, 444 
               C 375, 448 362, 430 378, 408 
               Z"
          />
          {/* Left End Circle Cap */}
          <ellipse cx="378" cy="426" rx="24" ry="36" />
          {/* Right End Inner Rolled Curve */}
          <path d="M 695, 350 C 710, 360 710, 376 695, 388" strokeWidth="11" fill="none" />
        </g>

        {/* White Ribbon Tie & Bow Knot on Scroll */}
        <g fill="#FFFFFF" strokeWidth="13">
          {/* Ribbon Wrap around Scroll */}
          <path d="M 520, 380 L 565, 372 L 555, 418 L 510, 424 Z" />

          {/* Left Bow Loop with Inner Hole */}
          <path d="M 526, 372 C 482, 318 504, 295 528, 348 Z" />
          <ellipse cx="516" cy="330" rx="7" ry="14" transform="rotate(-26 516 330)" />

          {/* Right Bow Loop with Inner Hole */}
          <path d="M 545, 370 C 588, 318 568, 295 544, 348 Z" />
          <ellipse cx="552" cy="330" rx="7" ry="14" transform="rotate(26 552 330)" />

          {/* Center Knot */}
          <ellipse cx="536" cy="368" rx="12" ry="11" />

          {/* Dangling Ribbon Tails with Swallowtail V-Notches */}
          {/* Left Tail */}
          <path d="M 524, 375 L 490, 482 L 514, 460 L 534, 476 L 536, 378 Z" />
          {/* Right Tail */}
          <path d="M 545, 375 L 565, 474 L 584, 452 L 604, 466 L 554, 378 Z" />
        </g>
      </g>

      {/* 6. Open Book (Buku Terbuka) */}
      <g stroke="#000000" strokeWidth="14" strokeLinejoin="round" fill="#FFFFFF">
        {/* Left Page Outer Shell */}
        <path
          d="M 500, 515 
             Q 435, 490 368, 518 
             L 394, 682 
             Q 452, 650 500, 672 
             Z"
        />
        {/* Right Page Outer Shell */}
        <path
          d="M 500, 515 
             Q 565, 490 632, 518 
             L 606, 682 
             Q 548, 650 500, 672 
             Z"
        />
        {/* Center Spine Divider */}
        <line x1="500" y1="515" x2="500" y2="672" strokeWidth="14" />

        {/* Text Lines on Left Page */}
        <g stroke="#000000" strokeWidth="10" strokeLinecap="round" fill="none">
          <path d="M 400, 546 Q 438, 530 480, 543" />
          <path d="M 404, 576 Q 442, 560 480, 573" />
          <path d="M 408, 606 Q 445, 590 480, 603" />
          <path d="M 412, 636 Q 448, 620 480, 633" />
        </g>

        {/* Text Lines on Right Page */}
        <g stroke="#000000" strokeWidth="10" strokeLinecap="round" fill="none">
          <path d="M 520, 543 Q 562, 530 600, 546" />
          <path d="M 520, 573 Q 558, 560 596, 576" />
          <path d="M 520, 603 Q 555, 590 592, 606" />
          <path d="M 520, 633 Q 552, 620 588, 636" />
        </g>
      </g>

      {/* 7. Bottom Blue Background Ribbon Wings (Pita Biru Sayap) */}
      <g stroke="#000000" strokeWidth="16" strokeLinejoin="round" fill="#0022E0">
        {/* Left Blue Ribbon Wing */}
        <path
          d="M 230, 770 
             L 6, 640 
             L 100, 755 
             L 30, 865 
             L 245, 878 
             Z"
        />
        {/* Left Inner Wing Detail Crease Line */}
        <path d="M 26, 662 L 100, 755 L 50, 845" stroke="#000000" strokeWidth="10" fill="none" />

        {/* Right Blue Ribbon Wing */}
        <path
          d="M 770, 770 
             L 994, 640 
             L 900, 755 
             L 970, 865 
             L 755, 878 
             Z"
        />
        {/* Right Inner Wing Detail Crease Line */}
        <path d="M 974, 662 L 900, 755 L 950, 845" stroke="#000000" strokeWidth="10" fill="none" />
      </g>

      {/* 8. Bottom Green Motto Banner with "USAHA JAYA" */}
      <g stroke="#000000" strokeLinejoin="round">
        {/* Green Outer Banner Body with Pointed Chevron Base */}
        <path
          d="M 170, 772 
             L 500, 888 
             L 830, 772 
             L 830, 955 
             L 500, 1070 
             L 170, 955 
             Z"
          fill="#00E824"
          strokeWidth="18"
        />

        {/* Inner Black Border Frame Inset */}
        <path
          d="M 192, 796 
             L 500, 902 
             L 808, 796 
             L 808, 935 
             L 500, 1044 
             L 192, 935 
             Z"
          fill="none"
          strokeWidth="11"
        />

        {/* Left Word: USAHA */}
        <text
          x="345"
          y="905"
          fontFamily="'Arial Black', 'Impact', 'Trebuchet MS', sans-serif"
          fontSize="78"
          fontWeight="900"
          fill="#000000"
          textAnchor="middle"
          stroke="none"
          transform="rotate(13.8 345 905)"
          letterSpacing="1px"
        >
          USAHA
        </text>

        {/* Right Word: JAYA */}
        <text
          x="655"
          y="905"
          fontFamily="'Arial Black', 'Impact', 'Trebuchet MS', sans-serif"
          fontSize="78"
          fontWeight="900"
          fill="#000000"
          textAnchor="middle"
          stroke="none"
          transform="rotate(-13.8 655 905)"
          letterSpacing="1px"
        >
          JAYA
        </text>
      </g>
    </svg>
  );
};

export const downloadLogoAsPng = async (filename = 'Logo_SK_Kepawa_HD.png') => {
  const custom = StorageService.getCustomLogo();
  if (custom) {
    // If it's custom image data URL
    const a = document.createElement('a');
    a.href = custom;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Generate HD PNG from SVG
  const svgElem = document.getElementById('school-logo-svg');
  let svgString = '';
  if (svgElem) {
    svgString = new XMLSerializer().serializeToString(svgElem);
  } else {
    // Fallback if not rendered on page
    svgString = `<svg viewBox="0 0 1000 1160" xmlns="http://www.w3.org/2000/svg">
      <defs><path id="t1" d="M 125, 340 A 420, 390 0 0,1 875, 340" fill="none"/></defs>
      <path d="M 82, 348 C 132, 60 415, 8 500, 8 C 585, 8 868, 60 918, 348 L 865, 372 L 832, 475 L 500, 835 L 168, 475 L 135, 372 Z" fill="#FFEA00" stroke="#000000" stroke-width="18"/>
      <text font-family="'Arial Black', sans-serif" font-weight="900" font-size="68" fill="#000"><textPath href="#t1" startOffset="50%" text-anchor="middle">SEK. KEB. KEPAWA</textPath></text>
      <path d="M 188, 350 C 255, 155 410, 110 500, 110 C 590, 110 745, 155 812, 350 C 715, 305 595, 222 500, 222 C 405, 222 285, 305 188, 350 Z" fill="#00D228" stroke="#000000" stroke-width="16"/>
      <path d="M 500, 222 C 595, 222 715, 305 812, 350 L 695, 515 L 500, 835 L 305, 515 L 188, 350 C 285, 305 405, 222 500, 222 Z" fill="#E60000" stroke="#000" stroke-width="15"/>
      <line x1="500" y1="222" x2="500" y2="835" stroke="#000" stroke-width="14"/>
      <line x1="290" y1="322" x2="500" y2="835" stroke="#000" stroke-width="11"/>
      <line x1="710" y1="322" x2="500" y2="835" stroke="#000" stroke-width="11"/>
      <path d="M 378, 408 L 695, 350 C 710, 347 724, 362 708, 388 L 392, 444 C 375, 448 362, 430 378, 408 Z" fill="#fff" stroke="#000" stroke-width="14"/>
      <ellipse cx="378" cy="426" rx="24" ry="36" fill="#fff" stroke="#000" stroke-width="14"/>
      <path d="M 520, 380 L 565, 372 L 555, 418 L 510, 424 Z" fill="#fff" stroke="#000" stroke-width="13"/>
      <path d="M 526, 372 C 482, 318 504, 295 528, 348 Z" fill="#fff" stroke="#000" stroke-width="13"/>
      <ellipse cx="516" cy="330" rx="7" ry="14" fill="#fff" stroke="#000" stroke-width="13" transform="rotate(-26 516 330)"/>
      <path d="M 545, 370 C 588, 318 568, 295 544, 348 Z" fill="#fff" stroke="#000" stroke-width="13"/>
      <ellipse cx="552" cy="330" rx="7" ry="14" fill="#fff" stroke="#000" stroke-width="13" transform="rotate(26 552 330)"/>
      <ellipse cx="536" cy="368" rx="12" ry="11" fill="#fff" stroke="#000" stroke-width="13"/>
      <path d="M 524, 375 L 490, 482 L 514, 460 L 534, 476 L 536, 378 Z" fill="#fff" stroke="#000" stroke-width="13"/>
      <path d="M 545, 375 L 565, 474 L 584, 452 L 604, 466 L 554, 378 Z" fill="#fff" stroke="#000" stroke-width="13"/>
      <path d="M 500, 515 Q 435, 490 368, 518 L 394, 682 Q 452, 650 500, 672 Z" fill="#fff" stroke="#000" stroke-width="14"/>
      <path d="M 500, 515 Q 565, 490 632, 518 L 606, 682 Q 548, 650 500, 672 Z" fill="#fff" stroke="#000" stroke-width="14"/>
      <line x1="500" y1="515" x2="500" y2="672" stroke="#000" stroke-width="14"/>
      <g stroke="#000" stroke-width="10" stroke-linecap="round"><path d="M 400, 546 Q 438, 530 480, 543"/><path d="M 404, 576 Q 442, 560 480, 573"/><path d="M 408, 606 Q 445, 590 480, 603"/><path d="M 412, 636 Q 448, 620 480, 633"/><path d="M 520, 543 Q 562, 530 600, 546"/><path d="M 520, 573 Q 558, 560 596, 576"/><path d="M 520, 603 Q 555, 590 592, 606"/><path d="M 520, 633 Q 552, 620 588, 636"/></g>
      <g stroke="#000" stroke-width="16" fill="#0022E0"><path d="M 230, 770 L 6, 640 L 100, 755 L 30, 865 L 245, 878 Z"/><path d="M 770, 770 L 994, 640 L 900, 755 L 970, 865 L 755, 878 Z"/></g>
      <path d="M 170, 772 L 500, 888 L 830, 772 L 830, 955 L 500, 1070 L 170, 955 Z" fill="#00E824" stroke="#000" stroke-width="18"/>
      <path d="M 192, 796 L 500, 902 L 808, 796 L 808, 935 L 500, 1044 L 192, 935 Z" fill="none" stroke="#000" stroke-width="11"/>
      <text x="345" y="905" font-family="'Arial Black', sans-serif" font-size="78" font-weight="900" fill="#000" text-anchor="middle" transform="rotate(13.8 345 905)">USAHA</text>
      <text x="655" y="905" font-family="'Arial Black', sans-serif" font-size="78" font-weight="900" fill="#000" text-anchor="middle" transform="rotate(-13.8 655 905)">JAYA</text>
    </svg>`;
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobURL = window.URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = 1000 * scale;
    canvas.height = 1160 * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobURL);
    }
  };
  img.src = blobURL;
};

export const downloadLogoAsSvg = (filename = 'Logo_SK_Kepawa.svg') => {
  const svgElem = document.getElementById('school-logo-svg');
  let svgString = '';
  if (svgElem) {
    svgString = new XMLSerializer().serializeToString(svgElem);
  }
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


