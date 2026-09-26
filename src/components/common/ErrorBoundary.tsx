import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  name?: string;
}

const DefaultFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const errMsg = (error as any)?.message || String(error) || 'Terjadi kesalahan saat merender tampilan.';
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-red-500/30 text-white flex flex-col items-center justify-center space-y-3 text-center my-4">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-white">Gagal Memuat Komponen</h4>
      <p className="text-xs text-slate-400 max-w-md">{errMsg}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center space-x-1.5 cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Coba Muat Ulang</span>
      </button>
    </div>
  );
};

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  fallbackRender,
  onError,
  name,
}) => {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        if (fallbackRender) {
          return fallbackRender(error as any, resetErrorBoundary);
        }
        if (fallback) {
          return fallback;
        }
        return <DefaultFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
      }}
      onError={(error, info) => {
        console.error(`[ErrorBoundary in ${name || 'Component'}]:`, error, info);
        if (onError) {
          onError(error as any, info as any);
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
