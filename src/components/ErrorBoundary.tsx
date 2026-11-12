import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare state: State;
  declare props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                Sistem G-TEPAT Memerlukan Muat Semula
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aplikasi telah mengesan gangguan kecil pada cache pelayar anda.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-300/80 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Muat Semula Halaman
              </button>
              <button
                type="button"
                onClick={this.handleClearAndReload}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] rounded-xl transition cursor-pointer"
              >
                Kosongkan Cache & Mulakan Semula
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
