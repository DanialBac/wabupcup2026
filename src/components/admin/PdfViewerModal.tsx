import React, { useState } from 'react';
import { UploadedDoc } from '../../types';
import {
  FileText,
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  CheckCircle,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck
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
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen || !document) return null;

  const pdfSource = document.fileData || document.previewUrl;
  const isImageFile = Boolean(
    pdfSource &&
    (pdfSource.startsWith('data:image/') ||
     (document.type && document.type.startsWith('image/')) ||
     document.name?.match(/\.(png|jpg|jpeg|webp|svg)$/i))
  );
  const isRealPdfFile = Boolean(
    !isImageFile &&
    pdfSource &&
    (pdfSource.startsWith('data:application/pdf') ||
     pdfSource.startsWith('blob:') ||
     pdfSource.startsWith('http://') ||
     pdfSource.startsWith('https://') ||
     document.name?.toLowerCase().endsWith('.pdf'))
  );

  return (
    <div
      id="pdf-viewer-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        id="pdf-viewer-container"
        className="relative w-full max-w-5xl h-[88vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white"
      >
        
        {/* HEADER TOOLBAR */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {documentTitle} • <span className="text-red-400">{teamName}</span>
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                File: {document.name} ({document.size}) • Tanggal Unggah: {document.uploadDate}
              </p>
            </div>
          </div>

          {/* ZOOM & ACTIONS */}
          <div className="flex items-center space-x-2 shrink-0">
            {pdfSource && (
              <a
                href={pdfSource}
                download={document.name || `${teamName}-${documentTitle}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
                title="Download Dokumen"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {onVerify && (
              <button
                onClick={onVerify}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Verifikasi</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF CANVAS / VIEWER BODY */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-hidden flex flex-col">
          {isImageFile ? (
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <img
                src={pdfSource}
                alt={`${documentTitle} - ${teamName}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                style={{ transform: `scale(${zoomLevel / 100})`, transition: 'transform 0.2s' }}
              />
            </div>
          ) : isRealPdfFile ? (
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col">
              <iframe
                src={`${pdfSource}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0 rounded-xl bg-white"
                title={`${documentTitle} - ${teamName}`}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <div
                className="w-full max-w-2xl min-h-[500px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* OFFICIAL DOCUMENT HEADER */}
                <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center space-y-1">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-red-700">
                    PANITIA PELAKSANA TURNAMEN WABUPCUP 2026
                  </h3>
                  <h2 className="text-base font-bold uppercase tracking-wider">
                    {documentTitle.toUpperCase()}
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Lampiran Berkas Resmi Tim: <strong className="text-slate-900">{teamName}</strong> • Tanggal Unggah: {document.uploadDate}
                  </p>
                </div>

                {/* DOCUMENT BODY CONTENT */}
                <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Metadata Berkas Database:
                    </span>
                    <p><strong>Nama Berkas:</strong> {document.name}</p>
                    <p><strong>Ukuran File:</strong> {document.size}</p>
                    <p><strong>Tipe File:</strong> {document.type || 'application/pdf'}</p>
                    <p><strong>Status Enkripsi:</strong> Terdaftar di Database Turnamen</p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <p>
                      Dengan ini menyatakan bahwa seluruh data pemain, official, dan dokumen pendukung yang dilampirkan adalah benar, sah, dan dapat dipertanggungjawabkan sesuai regulasi resmi Turnamen WabupCup 2026.
                    </p>
                    <p>
                      Segala bentuk manipulasi identitas (usia, domisili desa, atau kepegawaian instansi) akan dikenakan sanksi diskualifikasi langsung serta denda sesuai aturan kompetisi.
                    </p>
                  </div>

                  {/* SIGNATURE BOX */}
                  <div className="pt-8 flex justify-between items-end text-center">
                    <div className="w-36">
                      <div className="h-14 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Tanda Tangan & Cap Basah]
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-bold text-[11px]">
                        Kepala Sekolah / Kades / Pimpinan
                      </div>
                    </div>

                    <div className="w-36">
                      <div className="h-14 flex items-center justify-center text-slate-400 italic text-[10px]">
                        [Materai Rp 10.000]
                      </div>
                      <div className="border-t border-slate-800 pt-1 font-bold text-[11px]">
                        Pelatih / Manager Tim
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* FOOTER CONTROLS */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Dokumen Terverifikasi Standar PDF Panitia WABUPCUP 2026</span>
          </div>
          <div className="flex items-center space-x-3">
            {pdfSource && (
              <a
                href={pdfSource}
                download={document.name || `${teamName}-${documentTitle}.pdf`}
                className="text-red-400 hover:text-red-300 font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
            >
              Tutup Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
