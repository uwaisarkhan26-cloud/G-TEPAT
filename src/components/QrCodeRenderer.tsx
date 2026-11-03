import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeRendererProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeRenderer: React.FC<QrCodeRendererProps> = ({
  value,
  size = 200,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-xl animate-pulse ${className}`}
      >
        Menjana QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`Kod QR ${value}`}
      style={{ width: size, height: size }}
      className={`rounded-xl shadow-sm ${className}`}
    />
  );
};
