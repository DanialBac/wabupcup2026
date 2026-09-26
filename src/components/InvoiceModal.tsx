import React, { useState } from 'react';
import {
  X,
  Download,
  Phone,
  Printer,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  FileText,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { RegistrationItem, TournamentConfig } from '../types';
import { terbilang } from '../utils/numberToWords';
import {
  downloadOfficialInvoicePdf,
  getWhatsAppInvoiceShareUrl,
  shareInvoiceViaWhatsAppOrWeb,
} from '../utils/invoicePdf';
import {
  DEFAULT_SIGNATURE_SVG,
  DEFAULT_STAMP_SVG,
} from '../utils/signatureAndStamp';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RegistrationItem | null;
  config: TournamentConfig;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  item,
  config,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !item) return null;

  const tourneyName = config.name || 'Wabup Cup';
  const tourneyEdition = config.edition || '2026';
  const fullTourneyTitle = `${tourneyName} ${tourneyEdition}`.toUpperCase();
  const invNumber = `INV/WBC26/${item.category}/${item.regCode}`;

  const paymentDate = item.lastUpdated
    ? new Date(item.lastUpdated).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const chairmanName = config.committeeChairmanName || 'AHMAT IQBAL FIRDAUS';
  const chairmanTitle = config.committeeChairmanTitle || 'Ketua Panitia Pelaksana';

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadOfficialInvoicePdf(item, config);
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
      alert('Gagal membuat file PDF invoice. Silakan coba kembali.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareToWhatsApp = () => {
    const url = getWhatsAppInvoiceShareUrl(item, config);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWebShare = async () => {
    try {
      await shareInvoiceViaWhatsAppOrWeb(item, config);
    } catch (err) {
      console.warn('Share failed:', err);
    }
  };

  const handleCopyWhatsAppMessage = () => {
    const rawPhone = item.coachPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0')
      ? '62' + cleanPhone.slice(1)
      : cleanPhone.startsWith('62')
      ? cleanPhone
      : '62' + cleanPhone;

    const message = `🧾 *INVOICE & KUITANSI RESMI PEMBAYARAN ${fullTourneyTitle}*
--------------------------------------------------
Kepada Yth. *${item.coachName}*
Pelatih / Official Tim *${item.teamName}*

Terima kasih, pembayaran biaya pendaftaran tim Anda pada Turnamen Futsal *${fullTourneyTitle}* telah berhasil diverifikasi dengan status *LUNAS (PAID)*.

📋 *RINCIAN KEPESERTAAN RESMI:*
• *Nomor Invoice:* ${invNumber}
• *Kode Registrasi:* ${item.regCode}
• *Nama Tim:* ${item.teamName}
• *Kategori Pertandingan:* ${item.category}
• *Asal Instansi/Sekolah:* ${item.institutionName || '-'}
• *Komposisi Skuad:* ${item.playerCount} Pemain • ${item.officialCount} Official
• *Total Biaya:* Rp ${item.paymentAmount.toLocaleString('id-ID')} *(LUNAS)*

🏟️ *INFORMASI TEKNIS & LOKASI:*
• *Lokasi Turnamen:* ${config.venueName}, ${config.venueCity}
• *Jadwal Pertandingan:* ${config.tournamentStartDate} s/d ${config.tournamentEndDate}
• *Screening & Technical Meeting:* Wajib dihadiri perwakilan tim dengan membawa berkas asli & invoice ini.

Dokumen kuitansi resmi berstempel dan bertanda tangan ketua panitia siap diunduh melalui portal web resmi Wabup Cup 2026. Salam olahraga! ⚽🏆`;

    navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER TOOLBAR */}
        <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Invoice & Kuitansi Resmi</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  Lunas / Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {invNumber} • Tim {item.teamName} ({item.category})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Action: Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-950/40 transition cursor-pointer"
              title="Unduh Invoice Resmi format PDF (.pdf)"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Membuat PDF...' : 'Unduh PDF'}</span>
            </button>

            {/* Quick Action: Send to WhatsApp */}
            <button
              onClick={handleShareToWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
              title="Kirim Konfirmasi & Detail Invoice ke WhatsApp Pelatih"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim ke WA</span>
            </button>

            {/* Share / Copy Action */}
            <button
              onClick={handleCopyWhatsAppMessage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Salin Pesan WhatsApp"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer hidden md:flex"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (PRINTABLE / HIGH FIDELITY INVOICE DOCUMENT) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 print:p-0 print:bg-white">
          <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 relative overflow-hidden font-sans print:shadow-none print:border-none print:rounded-none">
            
            {/* Top red header bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-red-600 to-red-800" />

            {/* WATERMARK BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-25deg]">
              <span className="text-8xl sm:text-9xl font-black text-slate-900 tracking-widest uppercase">
                WABUP CUP
              </span>
            </div>

            {/* 1. KOP SURAT RESMI */}
            <div className="text-center space-y-1 relative pb-4 border-b-2 border-slate-900">
              <p className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-900 uppercase">
                Panitia Pelaksana Turnamen Futsal
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight">
                {fullTourneyTitle}
              </h1>
              <p className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-wide uppercase">
                {config.tagline || 'Perebutan Piala Wakil Bupati Banyuwangi'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 pt-1">
                WhatsApp Admin: <span className="font-semibold text-slate-700">{config.adminContactPhone || '-'}</span> • Email: <span className="font-semibold text-slate-700">{config.adminContactEmail || 'infinityorganizer01.22@gmail.com'}</span>
              </p>
              <div className="w-full h-0.5 bg-slate-400 mt-2" />
            </div>

            {/* 2. TITLE & STATUS BANNER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  KUITANSI & INVOICE PEMBAYARAN RESMI
                </h2>
                <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">
                  Official Tournament Registration Receipt
                </p>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center space-x-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>LUNAS (PAID)</span>
                </span>
              </div>
            </div>

            {/* 3. METADATA BAR (INVOICE NO, DATES, REG CODE) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nomor Invoice
                </span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {invNumber}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tanggal Pembayaran
                </span>
                <span className="font-bold text-slate-900 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{paymentDate}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Kode Registrasi Tim
                </span>
                <span className="font-extrabold text-red-700 font-mono text-sm">
                  {item.regCode}
                </span>
              </div>
            </div>

            {/* 4. DATA TIM & PENDAFTAR */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
                Data Identitas Pendaftar & Tim Resmi
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Nama Tim:</span>
                    <span className="font-black text-slate-900 text-sm">{item.teamName.toUpperCase()}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Kategori:</span>
                    <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      Kategori {item.category}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Asal Instansi:</span>
                    <span className="font-semibold text-slate-800">{item.institutionName || '-'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Pelatih / Official:</span>
                    <span className="font-bold text-slate-900">{item.coachName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Kontak WhatsApp:</span>
                    <span className="font-semibold text-slate-800 font-mono">{item.coachPhone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-medium">Komposisi Tim:</span>
                    <span className="font-semibold text-slate-800">
                      {item.playerCount} Pemain • {item.officialCount} Official
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. TABEL RINCIAN PEMBAYARAN */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-red-700 text-white font-bold">
                    <th className="py-2.5 px-3 text-center w-10">No</th>
                    <th className="py-2.5 px-4">Deskripsi / Uraian Pembayaran</th>
                    <th className="py-2.5 px-3 text-center w-24">Kategori</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-4 text-right w-36">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">1</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        Biaya Registrasi & Kepesertaan Turnamen Futsal {fullTourneyTitle}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">
                      1 Tim
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      Rp {item.paymentAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* SUMMARY FOOTER */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* TERBILANG BOX */}
                <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                    Terbilang:
                  </span>
                  <span className="font-bold italic text-slate-800 text-xs leading-relaxed block mt-0.5">
                    "{terbilang(item.paymentAmount)}"
                  </span>
                </div>

                {/* TOTAL STATS */}
                <div className="space-y-1.5 text-xs text-right">
                  <div className="flex justify-between sm:justify-end sm:space-x-8 text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">
                      Rp {item.paymentAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-end sm:space-x-8 text-emerald-700">
                    <span>Sisa Tagihan:</span>
                    <span className="font-bold">Rp 0 (LUNAS)</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between sm:justify-end sm:space-x-8 text-sm">
                    <span className="font-black text-red-700">TOTAL LUNAS:</span>
                    <span className="font-black text-red-700">
                      Rp {item.paymentAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. CATATAN & KETENTUAN RESMI */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
                Ketentuan & Keabsahan Dokumen:
              </span>
              <p>1. Kuitansi/Invoice ini adalah dokumen sah bukti pelunasan dan kepesertaan turnamen {fullTourneyTitle}.</p>
              <p>2. Wajib disimpan dan ditunjukkan (digital atau cetak) pada saat sesi Technical Meeting (TM) dan verifikasi berkas pemain.</p>
              <p>3. Biaya registrasi yang telah dilunasi dan divalidasi bersifat final dan mengikat sesuai regulasi resmi turnamen.</p>
            </div>

            {/* 7. AREA PENGESAHAN: VALIDASI DIGITAL + TTD & CAP RESMI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end pt-2">
              
              {/* Left Column: Digital Verification Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-xs pb-1 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Validasi Keaslian Dokumen</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  {/* Simulated QR Code graphic */}
                  <div className="w-14 h-14 bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between shrink-0">
                    <div className="flex justify-between">
                      <div className="w-3.5 h-3.5 bg-white rounded-sm p-0.5"><div className="w-full h-full bg-slate-900" /></div>
                      <div className="w-3.5 h-3.5 bg-white rounded-sm p-0.5"><div className="w-full h-full bg-slate-900" /></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-3.5 h-3.5 bg-white rounded-sm p-0.5"><div className="w-full h-full bg-slate-900" /></div>
                      <div className="w-2 h-2 bg-white rounded-xs" />
                    </div>
                  </div>

                  <div className="space-y-0.5 text-slate-600 text-[10px]">
                    <p className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>● TERVERIFIKASI RESMI</span>
                    </p>
                    <p className="font-mono text-slate-700 font-semibold">
                      ID: WBC26-{item.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-slate-400">
                      Sistem Database Panitia Pelaksana
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: TANDA TANGAN KETUA PANITIA & CAP WABUP CUP 2026 */}
              <div className="text-center relative sm:ml-auto w-full sm:w-64 space-y-1">
                <p className="text-xs text-slate-600">
                  {config.venueCity || 'Banyuwangi'}, {paymentDate}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  Panitia Pelaksana {fullTourneyTitle}
                </p>
                <p className="text-xs text-slate-600 pb-1">
                  Ketua Panitia Pelaksana,
                </p>

                {/* SIGNATURE & STAMP STACK CONTAINER */}
                <div className="relative h-24 w-full flex items-center justify-center my-1 select-none">
                  {/* OFFICIAL CAP WABUP CUP 2026 (RED CIRCULAR SEAL) */}
                  <div
                    className="absolute left-4 top-1 w-24 h-24 pointer-events-none opacity-90 z-20"
                    title="Cap Resmi Panitia Pelaksana Wabup Cup 2026"
                  >
                    {config.tournamentStampImage ? (
                      <img
                        src={config.tournamentStampImage}
                        alt="Cap Resmi Wabup Cup 2026"
                        className="w-full h-full object-contain -rotate-6"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: DEFAULT_STAMP_SVG }}
                      />
                    )}
                  </div>

                  {/* TANDA TANGAN KETUA PANITIA (AUTHENTIC VECTOR / IMAGE) */}
                  <div
                    className="relative w-44 h-24 flex items-center justify-center z-10"
                    title="Tanda Tangan Ketua Panitia Pelaksana"
                  >
                    {config.committeeChairmanSignature ? (
                      <img
                        src={config.committeeChairmanSignature}
                        alt="Tanda Tangan Ketua Panitia"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: DEFAULT_SIGNATURE_SVG }}
                      />
                    )}
                  </div>
                </div>

                {/* CHAIRMAN NAME & TITLE */}
                <div className="pt-1">
                  <p className="text-xs font-bold text-slate-900 underline decoration-slate-900 decoration-1 underline-offset-2">
                    {chairmanName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {chairmanTitle}
                  </p>
                </div>
              </div>

            </div>

            {/* 8. FOOTER NOTE */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
              <span>
                Dokumen ini dicetak otomatis dan sah melalui Sistem Manajemen Turnamen {fullTourneyTitle}.
              </span>
              <span>
                Halaman 1 dari 1 • Status: Lunas & Terverifikasi
              </span>
            </div>

          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Kirimkan berkas invoice ini kepada pelatih tim atau simpan sebagai arsip resmi kepesertaan.
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleWebShare}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan</span>
            </button>

            <button
              onClick={handleShareToWhatsApp}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Kirim ke WhatsApp Pelatih</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-red-950/40 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Mengunduh...' : 'Unduh PDF Invoice'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
