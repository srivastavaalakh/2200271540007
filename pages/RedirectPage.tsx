
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUrlByShortcode, recordClick } from '../services/urlStore';
import type { ShortenedUrl } from '../types';
import { Loader2, AlertTriangle, Home } from 'lucide-react';

const RedirectPage: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<ShortenedUrl | null>(null);

  useEffect(() => {
    if (!shortcode) {
      setError('No shortcode provided.');
      return;
    }

    const foundUrl = getUrlByShortcode(shortcode);

    if (!foundUrl) {
      setError('This short URL does not exist.');
      return;
    }

    if (foundUrl.expiresAt && foundUrl.expiresAt < Date.now()) {
      setError('This short URL has expired.');
      setUrl(foundUrl);
      return;
    }
    
    setUrl(foundUrl);
    recordClick(shortcode);
    window.location.href = foundUrl.longUrl;

  }, [shortcode]);

  if (error) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <h2 className="mt-4 text-xl font-semibold text-brand-text">Redirect Failed</h2>
        <p className="mt-1 text-brand-subtle">{error}</p>
        {url && <p className="mt-2 text-sm text-brand-subtle truncate max-w-md">Original URL: {url.longUrl}</p>}
        <Link to="/" className="mt-6 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-accent hover:bg-brand-accent-hover text-white transition-colors">
            <Home size={16} /> Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-20 flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-brand-accent animate-spin" />
      <h2 className="mt-4 text-xl font-semibold text-brand-text">Redirecting...</h2>
      <p className="mt-1 text-brand-subtle">Please wait while we send you to your destination.</p>
       {url && <p className="mt-2 text-sm text-brand-subtle truncate max-w-md">To: {url.longUrl}</p>}
    </div>
  );
};

export default RedirectPage;
