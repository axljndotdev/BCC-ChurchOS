import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex mb-6 overflow-x-auto no-scrollbar" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-maroon transition-colors"
          >
            <Home className="w-3 h-3 mr-2" />
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRight className="w-3 h-3 text-slate-300 mx-1" />
                {last ? (
                  <span className="text-xs font-bold text-slate-900">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-xs font-medium text-slate-400 hover:text-maroon transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
