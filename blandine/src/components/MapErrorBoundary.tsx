import { Component, type ReactNode } from 'react';

interface MapErrorBoundaryProps {
  children: ReactNode;
  onError?: () => void;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

// Empêche une erreur de Google Maps (clé refusée, marqueurs...) de faire planter toute la page
export default class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Carte Google Maps indisponible:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--surface-primary)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Carte indisponible pour le moment.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
