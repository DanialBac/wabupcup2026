import { RegistrationItem, TournamentConfig } from '../types';
import { terbilang } from './numberToWords';
import {
  getChairmanSignatureDataUrl,
  getOfficialStampDataUrl,
} from './signatureAndStamp';

export interface GeneratedInvoiceResult {
  doc: any; // jsPDF instance
  blob: Blob;
  dataUrl: string;
  filename: string;
}

/**
 * Generates an official, publication-grade PDF Invoice for a paid registrant.
 * Features:
 * - Official Kop Surat (Organization letterhead)
 * - Official Document Number & LUNAS / VERIFIED status badge
 * - Team & Coach registration details
 * - Itemized billing table & Terbilang (Spelled-out words in Indonesian)
 * - Official Regulations note & Verification Hash
 * - Official Red Round Stamp (Cap Wabup Cup 2026) overlapping the Chairman's Signature (TTD Ketua)
 */
export async function generateOfficialInvoicePdf(
  item: RegistrationItem,
  config: TournamentConfig
): Promise<GeneratedInvoiceResult> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const tourneyName = config.name || 'Wabup Cup';
  const tourneyEdition = config.edition || '2026';
  const fullTourneyTitle = `${tourneyName} ${tourneyEdition}`.toUpperCase();

  // 1. KOP SURAT RESMI (HEADER)
  // Decorative colored accent stripe at the very top
  doc.setFillColor(185, 28, 28); // red-700
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Header Texts
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PANITIA PELAKSANA TURNAMEN FUTSAL', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(17);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text(fullTourneyTitle, pageWidth / 2, 21, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    (config.tagline || 'PEREBUTAN PIALA WAKIL BUPATI BANYUWANGI').toUpperCase(),
    pageWidth / 2,
    26,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactLine = `WhatsApp Admin: ${config.adminContactPhone || '-'} | Email: ${config.adminContactEmail || 'infinityorganizer01.22@gmail.com'}`;
  doc.text(contactLine, pageWidth / 2, 31, { align: 'center' });

  // Double horizontal separator line (Kop line)
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(1.0);
  doc.line(margin, 35, pageWidth - margin, 35);

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.3);
  doc.line(margin, 36.3, pageWidth - margin, 36.3);

  // 2. INVOICE TITLE & STATUS BANNER
  let currentY = 41.5;

  // Invoice Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('KUITANSI & INVOICE PEMBAYARAN RESMI', margin, currentY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL TOURNAMENT PARTICIPATION RECEIPT', margin, currentY + 4.5);

  // Status Badge on the right
  const badgeWidth = 46;
  const badgeHeight = 9;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = currentY - 3;

  doc.setFillColor(22, 101, 52); // emerald-800
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('✔ LUNAS (PAID)', (badgeX + badgeWidth / 2) - 4 , badgeY + 6, { align: 'center' });

  // Invoice Meta bar (Invoice No, Dates)
  currentY += 12;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'FD');

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
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Meta 3-columns
  const col1X = margin + 4;
  const col2X = margin + 68;
  const col3X = margin + 128;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('NOMOR INVOICE', col1X, currentY + 4.5);
  doc.text('TANGGAL PEMBAYARAN', col2X, currentY + 4.5);
  doc.text('KODE REGISTRASI', col3X, currentY + 4.5);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(invNumber, col1X, currentY + 9.5);
  doc.text(paymentDate, col2X, currentY + 9.5);
  doc.setTextColor(185, 28, 28);
  doc.text(item.regCode, col3X, currentY + 9.5);

  // 3. DATA INFORMASI PENDAFTAR (CUSTOMER / TEAM INFO)
  currentY += 19;

  // Box background for team information
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'D');

  // Title of box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 7, 2, 2, 'F');
  doc.rect(margin, currentY + 4, contentWidth, 3, 'F'); // square bottom of header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DATA PENDAFTAR & IDENTITAS TIM RESMI', margin + 4, currentY + 5);

  // Content grid inside box
  const infoLeftX = margin + 4;
  const infoRightX = margin + 96;
  const line1Y = currentY + 13;
  const line2Y = currentY + 20;
  const line3Y = currentY + 27;

  // Left Column (Team details)
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Nama Tim:', infoLeftX, line1Y);
  doc.text('Kategori Lomba:', infoLeftX, line2Y);
  doc.text('Asal Sekolah / Instansi:', infoLeftX, line3Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(item.teamName.toUpperCase(), infoLeftX + 32, line1Y);
  doc.text(`Kategori ${item.category}`, infoLeftX + 32, line2Y);
  doc.text(item.institutionName || '-', infoLeftX + 32, line3Y);

  // Right Column (Coach & Squad details)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Pelatih / Official:', infoRightX, line1Y);
  doc.text('Kontak WhatsApp:', infoRightX, line2Y);
  doc.text('Jumlah Skuad Tim:', infoRightX, line3Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(item.coachName, infoRightX + 28, line1Y);
  doc.text(item.coachPhone, infoRightX + 28, line2Y);
  doc.text(`${item.playerCount} Pemain • ${item.officialCount} Official`, infoRightX + 28, line3Y);

  // 4. TABEL RINCIAN BIAYA (PAYMENT BREAKDOWN)
  currentY += 39;

  const tableHead = [
    ['NO', 'URAIAN / DESKRIPSI PEMBAYARAN', 'KATEGORI', 'QTY', 'JUMLAH (RP)'],
  ];

  const tableBody = [
    [
      '1',
      `Biaya Pendaftaran & Partisipasi Turnamen Futsal ${fullTourneyTitle}\n`,
      `Kategori ${item.category}`,
      '1 Tim',
      `Rp ${item.paymentAmount.toLocaleString('id-ID')}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [185, 28, 28], // red-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 92 },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'right', fontStyle: 'bold', cellWidth: 36 },
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY || currentY + 30;

  // Summary Table (Subtotal, Sisa, Total Lunas)
  const summaryBoxWidth = 80;
  const summaryX = pageWidth - margin - summaryBoxWidth;
  let summaryY = finalTableY + 2;

  // Box for Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryX, summaryY, summaryBoxWidth, 21, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal Biaya:', summaryX + 4, summaryY + 5);
  doc.text('Sisa Tagihan:', summaryX + 4, summaryY + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Rp ${item.paymentAmount.toLocaleString('id-ID')}`, summaryX + summaryBoxWidth - 4, summaryY + 5, {
    align: 'right',
  });
  doc.setTextColor(22, 101, 52);
  doc.text('Rp 0 (LUNAS)', summaryX + summaryBoxWidth - 4, summaryY + 10.5, { align: 'right' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 2, summaryY + 13, summaryX + summaryBoxWidth - 2, summaryY + 13);

  // Total Bayar (Bold Highlight)
  doc.setFontSize(8.5);
  doc.setTextColor(185, 28, 28);
  doc.text('TOTAL PEMBAYARAN:', summaryX + 4, summaryY + 18);
  doc.text(`Rp ${item.paymentAmount.toLocaleString('id-ID')}`, summaryX + summaryBoxWidth - 4, summaryY + 18, {
    align: 'right',
  });

  // Terbilang box on the left of summary
  const terbilangWidth = contentWidth - summaryBoxWidth - 4;
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(margin, summaryY, terbilangWidth, 21, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('TERBILANG:', margin + 4, summaryY + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bolditalic');
  doc.setTextColor(15, 23, 42);
  const spelledWords = `"${terbilang(item.paymentAmount)}"`;
  const splitSpelled = doc.splitTextToSize(spelledWords, terbilangWidth - 8);
  doc.text(splitSpelled, margin + 4, summaryY + 10.5);

  // 5. KETENTUAN RESMI & DOKUMEN KEABSAHAN (TERMS)
  currentY = summaryY + 25;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 20, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('KETENTUAN & KEABSAHAN DOKUMEN:', margin + 4, currentY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const note1 = '1. Kuitansi/Invoice ini merupakan bukti pembayaran sah dan tanda kepesertaan resmi Wabup Cup 2026.';
  const note2 = '2. Wajib disimpan dan ditunjukkan (berkas digital atau fisik) saat Technical Meeting (TM) & Screening.';
  const note3 = '3. Biaya registrasi yang telah dilunasi dan divalidasi bersifat mengikat dan tidak dapat ditarik kembali.';
  doc.text(note1, margin + 4, currentY + 8.5);
  doc.text(note2, margin + 4, currentY + 12.5);
  doc.text(note3, margin + 4, currentY + 16.5);

  // 6. AREA PENGESAHAN (SIGNATURE & OFFICIAL STAMP)
  currentY += 24;

  // Left Side: Digital Security Verification Box
  const verifBoxWidth = 84;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY + 4, verifBoxWidth, 42, 2, 2, 'D');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY + 4, verifBoxWidth, 6, 2, 2, 'F');
  doc.rect(margin, currentY + 8, verifBoxWidth, 2, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('VALIDASI KEASLIAN DIGITAL', margin + 3, currentY + 8.2);

  // Simulated QR/Security Barcode graphic
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + 4, currentY + 13, 16, 16, 1, 1, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(margin + 6, currentY + 15, 4, 4, 'F');
  doc.rect(margin + 14, currentY + 15, 4, 4, 'F');
  doc.rect(margin + 6, currentY + 23, 4, 4, 'F');
  doc.setFillColor(15, 23, 42);
  doc.rect(margin + 7, currentY + 16, 2, 2, 'F');
  doc.rect(margin + 15, currentY + 16, 2, 2, 'F');
  doc.rect(margin + 7, currentY + 24, 2, 2, 'F');

  // Security Verification text
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Status:', margin + 23, currentY + 15);
  doc.text('Kode Verifikasi:', margin + 23, currentY + 19);
  doc.text('ID Transaksi:', margin + 23, currentY + 23);
  doc.text('Dicetak Pada:', margin + 23, currentY + 27);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green
  doc.text('TERVERIFIKASI SISTEM', margin + 43, currentY + 15);
  doc.setTextColor(30, 41, 59);
  doc.text(`WBC26-${item.id.slice(0, 8).toUpperCase()}`, margin + 43, currentY + 19);
  doc.text(`TRX-${item.regCode}`, margin + 43, currentY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(`${printDate}`, margin + 43, currentY + 27);

  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Pindai atau masukkan kode di atas untuk verifikasi.', margin + 4, currentY + 34);
  doc.text('Sistem Database Resmi Wabup Cup 2026.', margin + 4, currentY + 38);

  // Right Side: TANDA TANGAN KETUA PANITIA & CAP WABUP CUP 2026
  const signColX = pageWidth - margin - 72; // center for signature column
  const signCenterX = signColX + 36;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${config.venueCity || 'Banyuwangi'}, ${paymentDate}`, signCenterX, currentY + 4, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Panitia Pelaksana Wabup Cup 2026', signCenterX, currentY + 8.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Ketua Panitia Pelaksana,', signCenterX, currentY + 12.5, { align: 'center' });

  // Get and add Chairman Signature and Official Stamp
  try {
    const signatureDataUrl = await getChairmanSignatureDataUrl(config.committeeChairmanSignature);
    const stampDataUrl = await getOfficialStampDataUrl(config.tournamentStampImage);

    // Place Signature image (width ~46mm, height ~28mm)
    const sigW = 46;
    const sigH = 26;
    const sigX = signCenterX - sigW / 2 + 4;
    const sigY = currentY + 12;

    if (signatureDataUrl) {
      doc.addImage(signatureDataUrl, 'PNG', sigX, sigY, sigW, sigH);
    }

    // Place Official Stamp image overlapping the signature on the left
    // (authentic Indonesian official stamp etiquette: stamp is placed slightly to the left overlapping the signature)
    const stampSize = 30; // 30x30 mm
    const stampX = signCenterX - stampSize + 2;
    const stampY = currentY + 12;

    if (stampDataUrl) {
      doc.addImage(stampDataUrl, 'PNG', stampX, stampY, stampSize, stampSize);
    }
  } catch (err) {
    console.warn('Failed to embed signature/stamp image in jsPDF:', err);
  }

  // Chairman Name & ID Panitia (underneath signature)
  const chairmanName = config.committeeChairmanName || 'AHMAT IQBAL FIRDAUS';
  const chairmanTitle = config.committeeChairmanTitle || 'Ketua Panitia Pelaksana';

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(chairmanName, signCenterX, currentY + 41.5, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(chairmanName);
  doc.setLineWidth(0.3);
  doc.setDrawColor(15, 23, 42);
  doc.line(signCenterX - nameWidth / 2, currentY + 42.5, signCenterX + nameWidth / 2, currentY + 42.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(chairmanTitle, signCenterX, currentY + 46.5, { align: 'center' });

  // 7. FOOTER
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen ini diterbitkan sah oleh Sistem Informasi Manajemen Turnamen ${fullTourneyTitle} • Halaman 1 dari 1`,
    margin,
    pageHeight - 8
  );
  doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - margin, pageHeight - 8, {
    align: 'right',
  });

  // Prepare Output
  const filename = `INVOICE_${tourneyName.replace(/\s+/g, '')}_${item.regCode}_${item.teamName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');

  return {
    doc,
    blob,
    dataUrl,
    filename,
  };
}

/**
 * Downloads the official PDF Invoice directly in the browser
 */
export async function downloadOfficialInvoicePdf(
  item: RegistrationItem,
  config: TournamentConfig
): Promise<void> {
  const result = await generateOfficialInvoicePdf(item, config);
  result.doc.save(result.filename);
}

/**
 * Generates an official, polite WhatsApp message ready to be sent to the team coach/official
 * with full payment confirmation, invoice number, and schedule information.
 */
export function getWhatsAppInvoiceShareUrl(
  item: RegistrationItem,
  config: TournamentConfig
): string {
  const rawPhone = item.coachPhone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const tourneyName = config.name || 'Wabup Cup';
  const tourneyEdition = config.edition || '2026';
  const fullTourneyTitle = `${tourneyName} ${tourneyEdition}`.toUpperCase();
  const invNumber = `INV/WBC26/${item.category}/${item.regCode}`;

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

📄 *PENGUNDUHAN DOKUMEN INVOICE RESMI (PDF):*
Dokumen kuitansi/invoice resmi berstempel basah Wabup Cup 2026 & bertanda tangan Ketua Panitia Pelaksana siap diunduh melalui portal resmi turnamen (Menu *Cek Status* -> Masukkan Kode *${item.regCode}*).

Sampai jumpa di lapangan, junjung tinggi sportivitas dan salam olahraga! ⚽🏆

_Panitia Pelaksana Turnamen Futsal ${fullTourneyTitle}_`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Attempts to share the PDF file directly via Web Share API (if supported on mobile browsers),
 * or falls back to opening WhatsApp with the pre-filled official notification text.
 */
export async function shareInvoiceViaWhatsAppOrWeb(
  item: RegistrationItem,
  config: TournamentConfig
): Promise<void> {
  const waUrl = getWhatsAppInvoiceShareUrl(item, config);

  // Check if Web Share API with files is supported (e.g. mobile Chrome, Safari)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const result = await generateOfficialInvoicePdf(item, config);
      const file = new File([result.blob], result.filename, { type: 'application/pdf' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice Resmi Wabup Cup 2026 - ${item.teamName}`,
          text: `Invoice Resmi Pembayaran Lunas Turnamen Futsal Wabup Cup 2026 untuk Tim ${item.teamName} (${item.regCode}).`,
        });
        return;
      }
    } catch (e: any) {
      // If user cancelled share, don't fallback to URL redirect
      if (e?.name === 'AbortError') return;
      console.warn('Web Share failed, falling back to direct WhatsApp link:', e);
    }
  }

  // Standard WhatsApp URL redirect
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
