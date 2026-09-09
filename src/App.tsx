import { Component, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LibraryRoute } from "./routes/LibraryRoute";
import { EditorRoute } from "./routes/EditorRoute";
import { PrintRoute } from "./routes/PrintRoute";
import { ToastProvider } from "./components/ui/Toast";
import { useSettingsStore } from "./state/settingsStore";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./components/ui/Button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 bg-surface rounded-card border border-border shadow-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-semibold text-text">Something went wrong</h2>
            <p className="text-xs text-text-muted">
              {this.state.error?.message || "An unexpected error occurred in ScriptFlow."}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = "#/";
                  window.location.reload();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const { initSettings } = useSettingsStore();

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LibraryRoute />} />
            <Route path="/editor/:id" element={<EditorRoute />} />
            <Route path="/print/:id" element={<PrintRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}