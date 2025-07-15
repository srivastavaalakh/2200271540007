
import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_TITLE } from '../constants';
import { Link, BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-accent text-white'
        : 'text-gray-300 hover:bg-brand-primary hover:text-white'
    }`;

  return (
    <header className="bg-brand-primary/50 backdrop-blur-sm sticky top-0 z-10">
      <nav className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white font-bold text-xl flex items-center gap-2">
              <span className="text-brand-accent">{APP_TITLE}</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-4">
            <NavLink to="/" className={linkClass}>
              <Link size={18} />
              Shorten
            </NavLink>
            <NavLink to="/stats" className={linkClass}>
              <BarChart2 size={18} />
              Statistics
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
