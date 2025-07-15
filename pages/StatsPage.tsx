
import React, { useState, useEffect } from 'react';
import { getAllUrls } from '../services/urlStore';
import { analyzeTraffic } from '../services/geminiService';
import type { ShortenedUrl } from '../types';
import { BarChart2, ChevronDown, Clock, Copy, Check, ExternalLink, BrainCircuit, Loader2, AlertTriangle } from 'lucide-react';

const StatsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Record<string, { loading: boolean; text: string | null; error: string | null }>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setUrls(getAllUrls());
  }, []);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const getShortUrl = (shortcode: string) => `${window.location.origin}${window.location.pathname}#/r/${shortcode}`;

  const handleAnalyzeTraffic = async (url: ShortenedUrl) => {
    if (analysis[url.id]?.loading) return;

    setAnalysis(prev => ({ ...prev, [url.id]: { loading: true, text: null, error: null } }));
    
    try {
      const result = await analyzeTraffic(url.clicks);
      setAnalysis(prev => ({ ...prev, [url.id]: { loading: false, text: result, error: null } }));
    } catch(err) {
      const error = err instanceof Error ? err.message : "An unknown error occurred.";
      setAnalysis(prev => ({ ...prev, [url.id]: { loading: false, text: null, error } }));
    }
  };


  if (urls.length === 0) {
    return (
      <div className="text-center py-20">
        <BarChart2 className="mx-auto h-12 w-12 text-brand-subtle" />
        <h2 className="mt-2 text-xl font-semibold text-brand-text">No Statistics Yet</h2>
        <p className="mt-1 text-brand-subtle">Shorten some URLs on the main page to see their stats here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-brand-text">URL Statistics</h1>
        <p className="mt-2 text-brand-subtle">Review the performance of your shortened links.</p>
      </div>
      <div className="space-y-4">
        {urls.map((url) => {
          const isExpired = url.expiresAt ? url.expiresAt < Date.now() : false;
          const currentAnalysis = analysis[url.id];

          return (
            <div key={url.id} className={`bg-brand-primary rounded-lg border border-brand-subtle/50 transition-all duration-300 ${isExpired ? 'opacity-60' : ''}`}>
              <div className="p-4 cursor-pointer" onClick={() => handleToggle(url.id)}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a href={getShortUrl(url.shortcode)} onClick={e=>e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-brand-accent hover:underline truncate">
                        {getShortUrl(url.shortcode).replace(/https?:\/\//, '')}
                      </a>
                       <button onClick={(e) => { e.stopPropagation(); handleCopy(getShortUrl(url.shortcode)); }} className="p-1 text-brand-subtle hover:text-brand-text transition-colors" title="Copy Short URL">
                         {copied === getShortUrl(url.shortcode) ? <Check size={16} className="text-green-400"/> : <Copy size={16} />}
                       </button>
                    </div>
                    <p className="text-sm text-brand-subtle truncate" title={url.longUrl}>To: {url.longUrl}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6 text-sm flex-shrink-0">
                    <div className="flex items-center gap-2" title="Total Clicks">
                      <BarChart2 size={16} className="text-brand-accent" />
                      <span>{url.clicks.length} Clicks</span>
                    </div>
                     <div className="flex items-center gap-2" title={`Expires ${isExpired ? 'on' : 'at'}`}>
                      <Clock size={16} className={isExpired ? 'text-red-400' : 'text-brand-accent'} />
                      <span>{isExpired ? 'Expired' : (url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never')}</span>
                    </div>
                    <ChevronDown className={`transform transition-transform duration-200 ${expandedId === url.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
              {expandedId === url.id && (
                <div className="border-t border-brand-subtle/50 p-4 space-y-4">
                  <h3 className="font-semibold text-brand-text">Click Details</h3>
                  {url.clicks.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto pr-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-brand-secondary">
                                <tr>
                                    <th className="py-2 px-4">Timestamp</th>
                                    <th className="py-2 px-4">Source</th>
                                    <th className="py-2 px-4">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                {url.clicks.slice().reverse().map(click => (
                                    <tr key={click.timestamp} className="border-b border-brand-subtle/30">
                                        <td className="py-2 px-4">{new Date(click.timestamp).toLocaleString()}</td>
                                        <td className="py-2 px-4">{click.source}</td>
                                        <td className="py-2 px-4">{click.location}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  ) : <p className="text-brand-subtle text-sm">No clicks recorded yet.</p>}

                  <div className="pt-4 border-t border-brand-subtle/30">
                    <button 
                      onClick={() => handleAnalyzeTraffic(url)}
                      disabled={currentAnalysis?.loading}
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30 disabled:opacity-50 transition-colors"
                    >
                      {currentAnalysis?.loading ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                      {currentAnalysis?.loading ? 'Analyzing...' : 'Analyze with Gemini'}
                    </button>
                    {currentAnalysis && !currentAnalysis.loading && (
                      <div className="mt-4 p-3 rounded-md bg-brand-secondary text-sm">
                        {currentAnalysis.text && <p className="text-gray-300">{currentAnalysis.text}</p>}
                        {currentAnalysis.error && <p className="text-red-400 flex items-center gap-2"><AlertTriangle size={16}/> {currentAnalysis.error}</p>}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPage;
