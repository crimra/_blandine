import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: 'map', label: 'Carte', path: '/map' },
  { icon: 'format_list_bulleted', label: 'Liste', path: '/list' },
  { icon: 'medical_services', label: 'De Garde', path: '/on-duty' },
  { icon: 'person', label: 'Compte', path: '/account' }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[2rem] bg-[#f7f9fb]/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-8px_32px_rgba(25,28,30,0.06)] flex justify-around items-center h-20 px-4 pb-safe w-full">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center rounded-xl px-4 py-1 active:scale-90 transition-transform duration-150 ${
              isActive
                ? 'text-[#006c51] dark:text-[#00a67e] bg-[#006c51]/10 dark:bg-[#00a67e]/10'
                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
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
