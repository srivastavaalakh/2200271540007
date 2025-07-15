
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20 flex flex-col items-center">
      <Compass className="h-16 w-16 text-brand-accent" />
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-brand-text sm:text-5xl">Page Not Found</h1>
      <p className="mt-6 text-base leading-7 text-brand-subtle">Sorry, we couldn’t find the page you’re looking for.</p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <RouterLink
          to="/"
          className="rounded-md bg-brand-accent px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
        >
          <Home size={16} />
          Go back home
        </RouterLink>
      </div>
    </div>
  );
};

export default NotFoundPage;
