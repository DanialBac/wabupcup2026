import React, { useState, useEffect, useRef } from 'react';
import { UploadedDoc } from '../../types';
import {
  FileText,
  X,
  Download,
  CheckCircle,
  Loader2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: UploadedDoc | null;
  documentTitle: string;
  teamName: string;
  onVerify?: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  documentTitle,
  teamName,
  onVerify,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const createdBlobRef = useRef<string | null>(null);

  // Convert Base64 Data URI to a local Blob URL for maximum performance and zero-lag rendering
  useEffect(() => {
    if (createdBlobRef.current) {
      URL.revokeObjectURL(createdBlobRef.current);
      createdBlobRef.current = null;
    }
    setBlobUrl(null);
    setHasError(false);
    setZoomLevel(100);

    if (!isOpen || !document) return;

    const rawSource = document.fileData || document.previewUrl || document.url;
    if (!rawSource) return;

    // 1. Sudah berupa Blob URL
    if (rawSource.startsWith('blob:')) {
      setBlobUrl(rawSource);
      return;
    }

    // 2. Base64 Data URI: ubah ke Blob URL lokal
    if (rawSource.startsWith('data:')) {
      try {
        const parts = rawSource.split(',');
        const header = parts[0];
        const base64Data = parts[1];
        if (!base64Data) {
          setBlobUrl(rawSource);
          return;
        }

        const mimeMatch = header.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : (document.type || 'application/pdf');

        const byteChars = atob(base64Data);
        const byteNumbers = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const b = new Blob([byteNumbers], { type: mimeType });
        const localUrl = URL.createObjectURL(b);
        createdBlobRef.current = localUrl;
        setBlobUrl(localUrl);
      } catch (err) {
        console.warn('[PdfViewerModal] Base64 decode to Blob warning:', err);
        setBlobUrl(rawSource);
      }
      return;
    }

    // 3. Remote URL (misal /api/media/view/...)
    setBlobUrl(rawSource);

    return () => {
      if (createdBlobRef.current) {
        URL.revokeObjectURL(createdBlobRef.current);
        createdBlobRef.current = null;
      }
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const activeSource = blobUrl || document.fileData || document.previewUrl || document.url || '';

  const isImageFile = Boolean(
    activeSource &&
    (activeSource.startsWith('data:image/') ||
     (document.type && document.type.startsWith('image/')) ||
     document.name?.match(/\.(png|jpg|jpeg|webp|svg)$/i))
  );

  const isRealPdfFile = Boolean(
    !isImageFile &&
    activeSource &&
    (activeSource.startsWith('data:application/pdf') ||
     activeSource.startsWith('blob:') ||
     activeSource.startsWith('http://') ||
     activeSource.startsWith('https://') ||
     activeSource.startsWith('/api/') ||
     document.name?.toLowerCase().endsWith('.pdf') ||
     document.type === 'application/pdf')
  );

  const handleZoomIn = () => setZoomLevel(prev => Math.min(250, prev + 25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 25));
  const handleZoomReset = () => setZoomLevel(100);

  return (
    <div
      id="pdf-viewer-modal-overlay"
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="pdf-viewer-container"
        className="relative w-full max-w-5xl h-[92vh] max-h-[950px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER TOOLBAR */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white truncate">
                {documentTitle} • <span className="text-red-400">{teamName}</span>
              </h4>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span>File: {document.name} {document.size ? `(${document.size})` : ''}</span>
                {document.uploadDate && <span>• Diunggah: {document.uploadDate}</span>}
                {isRealPdfFile && <span className="text-emerald-400 font-semibold">• PDF Siap</span>}
                {isImageFile && <span className="text-blue-400 font-semibold">• Gambar</span>}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Image zoom controls */}
            {isImageFile && (
              <div className="hidden sm:flex items-center space-x-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-1 font-semibold text-slate-300 min-w-[40px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded hover:bg-slate-700 text-slate-300 transition"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold"
                >
                  100%
                </button>
              </div>
            )}

            {/* Buka Tab Baru */}
            {activeSource && (
              <a
                href={activeSource}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
                title="Buka dokumen di tab baru browser"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Buka Tab Baru</span>
              </a>
            )}

            {/* Unduh Dokumen */}
            {activeSource && (
              <a
                href={activeSource}
                download={document.name || `${teamName}-${documentTitle}.pdf`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700 cursor-pointer"
                title="Unduh file dokumen"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Unduh</span>
              </a>
            )}

            {/* Tombol Verifikasi jika disediakan */}
            {onVerify && (
              <button
                type="button"
                onClick={onVerify}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-950"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verifikasi</span>
              </button>
            )}

            {/* Tombol Tutup Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-3 overflow-hidden flex flex-col relative">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Menyiapkan berkas dokumen...</p>
            </div>
          ) : isImageFile && activeSource ? (
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <img
                src={activeSource}
                alt={`${documentTitle} - ${teamName}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel / 100})` }}
                onError={() => setHasError(true)}
              />
            </div>
          ) : isRealPdfFile && activeSource ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col relative">
              <iframe
                src={`${activeSource}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0 rounded-xl bg-white"
                title={`${documentTitle} - ${teamName}`}
                loading="eager"
              />
            </div>
          ) : (
            /* Fallback Tampilan Lembar Informasi Berkas Panitia */
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div
                className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-red-700">
                    PANITIA PELAKSANA TURNAMEN WABUPCUP 2026
                  </h3>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                    {documentTitle.toUpperCase()}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Lampiran Berkas Resmi Tim: <strong className="text-slate-900">{teamName}</strong>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                    <FileCheck className="w-4 h-4" />
                    <span>Metadata Berkas Terdaftar di Database Turnamen</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div><strong>Nama Berkas:</strong> {document.name}</div>
                    <div><strong>Ukuran:</strong> {document.size || 'Tercatat'}</div>
                    <div><strong>Tipe:</strong> {document.type || 'Dokumen'}</div>
                    <div><strong>Tanggal Unggah:</strong> {document.uploadDate || '-'}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-slate-600">
                  <p>
                    Dokumen ini telah diunggah dan terverifikasi dalam sistem database turnamen untuk tim <strong>{teamName}</strong>.
                  </p>
                  <p>
                    Segala bentuk manipulasi identitas (usia, domisili, atau kepegawaian) akan dikenakan sanksi diskualifikasi sesuai regulasi resmi Turnamen WabupCup 2026.
                  </p>
                </div>

                {activeSource && (
                  <div className="pt-2 flex justify-center">
                    <a
                      href={activeSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka File Dokumen Asli</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
