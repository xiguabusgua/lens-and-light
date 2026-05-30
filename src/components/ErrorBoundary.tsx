import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-primary px-4">
          <div className="text-center max-w-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-8">
              <AlertTriangle size={36} className="text-accent" />
            </div>
            <h1 className="font-display text-3xl text-secondary mb-4">
              页面加载出错
            </h1>
            <p className="font-body text-secondary/60 mb-8 leading-relaxed">
              很抱歉，页面渲染时发生了错误。请刷新页面或稍后再试。
            </p>
            {this.state.error && (
              <details className="text-left mb-8">
                <summary className="font-ui text-xs text-accent cursor-pointer tracking-wider uppercase">
                  查看错误详情
                </summary>
                <pre className="mt-3 p-4 bg-surface rounded-lg text-xs text-secondary/60 overflow-auto max-h-40 font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-ui text-sm uppercase tracking-wider rounded-sm hover:bg-accent-light transition-colors duration-300"
            >
              <RefreshCw size={14} />
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
