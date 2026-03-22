import { useNavigate } from 'react-router-dom';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export default function TopAppBar({ title = 'PharmaSerene', showBack = false, actions }: TopAppBarProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl flex justify-between items-center px-5 h-16" style={{ backgroundColor: 'var(--surface-primary)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:opacity-80 transition-opacity active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <h1 className="font-headline font-extrabold tracking-tighter text-lg" style={{ color: 'var(--primary)' }}>
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </header>
  );
}
