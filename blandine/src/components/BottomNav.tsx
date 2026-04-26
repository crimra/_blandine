import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: 'map', label: 'Carte', path: '/map' },
  { icon: 'format_list_bulleted', label: 'Liste', path: '/list' },
  { icon: 'medical_services', label: 'De Garde', path: '/on-duty' }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[2rem] backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.4)] flex justify-around items-center h-20 px-4 pb-safe w-full" style={{ backgroundColor: 'var(--surface-primary)', borderTop: '1px solid var(--border-subtle)' }}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform duration-150`}
            style={{
              color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
              backgroundColor: isActive ? 'rgba(0, 214, 143, 0.1)' : 'transparent'
            }}
          >
            <span 
              className="material-symbols-outlined" 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] text-[11px] font-semibold uppercase tracking-wider mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
