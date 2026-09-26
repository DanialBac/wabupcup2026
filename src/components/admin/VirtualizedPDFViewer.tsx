import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { List } from 'react-window';
import { usePdfLoader } from '../../hooks/usePdfLoader';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  Layers,
  Database,
  RefreshCw,
} from 'lucide-react';

// Configure Mozilla PDF.js worker for react-pdf
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  } catch (err) {
    console.warn('[react-pdf worker setup]', err);
  }
}

interface VirtualizedPDFViewerProps {
  source: string;
  documentTitle?: string;
  teamName?: string;
  onFallbackToIframe?: () => void;
}

interface CustomRowProps {
  scale: number;
  baseWidth: number;
  baseHeight: number;
  onPageLoadSuccess: (page: any) => void;
}

// Row component for react-window
// ONLY visible pages are rendered and kept in memory
const VirtualizedPageRow = ({
  index,
  style,
  scale,
  baseWidth,
  baseHeight,
  onPageLoadSuccess,
}: {
  index: number;
  style: React.CSSProperties;
  ariaAttributes?: any;
} & CustomRowProps) => {
  const pageNum = index + 1;
  const targetWidth = Math.round(baseWidth * scale);
  const targetHeight = Math.round(baseHeight * scale);

  return (
    <div style={style} className="flex items-center justify-center p-2 box-border select-none">
      <div
        style={{ width: `${targetWidth}px`, minHeight: `${targetHeight}px` }}
        className="bg-white rounded-lg shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-150"
      >
        <Page
          pageNumber={pageNum}
          scale={scale}
          onLoadSuccess={pageNum === 1 ? onPageLoadSuccess : undefined}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={
            <div
              style={{ width: `${targetWidth}px`, height: `${targetHeight}px` }}
              className="flex flex-col items-center justify-center bg-slate-900/60 text-slate-400 space-y-2"
            >
              <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-300">
                Memproses Halaman {pageNum}...
              </span>
            </div>
          }
          error={
            <div
              style={{ width: `${targetWidth}px`, height: `${targetHeight}px` }}
              className="flex flex-col items-center justify-center bg-slate-900/80 text-red-400 space-y-2 p-4 text-center"
            >
              <AlertCircle className="w-8 h-8" />
              <span className="text-xs font-medium">Gagal me-render Halaman {pageNum}</span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export const VirtualizedPDFViewer: React.FC<VirtualizedPDFViewerProps> = ({
  source,
  documentTitle,
  teamName,
  onFallbackToIframe,
}) => {
  // 1. In-memory ArrayBuffer cache via SWR (staleTime: Infinity)
  const { data: arrayBuffer, isLoading: isBufferLoading, error: bufferError, mutate } = usePdfLoader(source);

  // Document & Virtualization state
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15); // Zoom level
  const [baseWidth, setBaseWidth] = useState<number>(595); // A4 default width
  const [baseHeight, setBaseHeight] = useState<number>(842); // A4 default height
  const [docLoadError, setDocLoadError] = useState<string | null>(null);

  const listRef = useRef<any>(null);

  // Handle successful PDF load from ArrayBuffer
  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setDocLoadError(null);
    },
    []
  );

  // Read dimensions from page 1 to set aspect ratio
  const onPageLoadSuccess = useCallback((page: any) => {
    if (page && page.pageNumber === 1) {
      const originalWidth = page.originalWidth || page.width || 595;
      const originalHeight = page.originalHeight || page.height || 842;
      setBaseWidth(originalWidth);
      setBaseHeight(originalHeight);
    }
  }, []);

  // Calculate virtual row height
  const calculateRowHeight = useCallback(
    (_index: number, props: CustomRowProps) => {
      return Math.round(props.baseHeight * props.scale) + 24;
    },
    []
  );

  // Zoom controls: Zooming only modifies scale; react-window re-renders ONLY visible pages
  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.6, +(prev - 0.15).toFixed(2)));
  };

  const handleZoomReset = () => {
    setScale(1.15);
  };

  // Scroll to page
  const scrollToPage = (pageNum: number) => {
    if (listRef.current && pageNum >= 1 && pageNum <= numPages) {
      listRef.current.scrollToRow({ index: pageNum - 1, align: 'start' });
      setCurrentPage(pageNum);
    }
  };

  // Memoized file prop for react-pdf Document to prevent re-parsing
  const fileProp = useMemo(() => {
    if (!arrayBuffer) return null;
    return { data: new Uint8Array(arrayBuffer) };
  }, [arrayBuffer]);

  // Memoized rowProps for react-window
  const rowProps: CustomRowProps = useMemo(
    () => ({
      scale,
      baseWidth,
      baseHeight,
      onPageLoadSuccess,
    }),
    [scale, baseWidth, baseHeight, onPageLoadSuccess]
  );

  // Loading state (fetching ArrayBuffer via SWR)
  if (isBufferLoading || !fileProp) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-300 p-8 bg-slate-950">
        <Loader2 className="w-9 h-9 text-red-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-bold text-white">Memuat Dokumen PDF ke Cache Memori...</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            ArrayBuffer disimpan di SWR Cache (staleTime: Infinity). Scrolling & zooming tidak akan memicu pemanggilan jaringan ulang.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (bufferError || docLoadError) {
    const errorMsg = bufferError?.message || docLoadError || 'Gagal memproses berkas PDF.';
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-950">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-white">Gagal Membuka Dokumen PDF Virtual</h5>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{errorMsg}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => mutate()}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
          {onFallbackToIframe && (
            <button
              onClick={onFallbackToIframe}
              className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-xs font-semibold text-red-400 border border-red-500/30 flex items-center space-x-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Gunakan Penampil Iframe Standar</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 select-none">
      {/* TOOLBAR KONTROL ZOOM & VIRTUALISASI */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {/* Navigasi Halaman */}
        <div className="flex items-center space-x-2 text-slate-300">
          <button
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-200">
            Halaman <span className="text-red-400 font-bold">{currentPage}</span> / {numPages || '...'}
          </span>
          <button
            onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Indikator Virtualisasi & SWR Cache */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <Database className="w-3.5 h-3.5" />
            <span className="font-semibold">SWR Memory Cache (staleTime: ∞)</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>react-window Virtualized</span>
          </div>
        </div>

        {/* Kontrol Zooming */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] text-slate-300 min-w-[42px] text-center font-bold">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition text-[10px] font-semibold px-1"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* CONTAINER DOKUMEN VIRTUAL MENGGUNAKAN REACT-PDF & REACT-WINDOW */}
      <div className="flex-1 w-full h-full overflow-hidden bg-slate-950">
        <Document
          file={fileProp}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setDocLoadError(err?.message || 'Gagal memuat dokumen PDF.')}
          loading={null}
        >
          {numPages > 0 && (
            <List<CustomRowProps>
              listRef={listRef}
              rowCount={numPages}
              rowHeight={calculateRowHeight}
              rowComponent={VirtualizedPageRow}
              rowProps={rowProps}
              overscanCount={1}
              onRowsRendered={({ startIndex }) => setCurrentPage(startIndex + 1)}
              className="w-full h-full scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950"
            />
          )}
        </Document>
      </div>
    </div>
  );
};
