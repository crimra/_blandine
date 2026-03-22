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
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:opacity-80 transition-opacity active:scale-95"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <button className="active:scale-95 duration-200" style={{ color: 'var(--primary)' }}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <h1 className="font-headline font-extrabold tracking-tighter text-lg" style={{ color: 'var(--primary)' }}>
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="w-8 h-8 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-secondary)' }}>
          <img
            alt="Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqz_I3b2YRhD8aTedg_Jg4hUadapVY4VqUjBTl53HPvmptGOnBgwvUHm71icQLfK2Gxvvhgd4G9OGnEM5echyHYUpk8YsWT6Y4jVwhQv_Wxlk8pxe5t4R-u-u8wGdUfXykGyRFyG6DHVNJ6HLMpYhP_BzrLQWWYa0W3-6W1CvZNkfGMlGpcY6_1vUTjUOYxfl0OA-VU-DtcYKeZtQpgkDLhHvzb4d0dwH1RIE410F1E8SpPk4ughzGNMVBBG877RE8KeaZNRzZP6M"
          />
        </div>
      </div>
    </header>
  );
}
