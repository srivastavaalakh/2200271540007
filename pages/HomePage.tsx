import React, { useState } from 'react';
import type { UrlInput, ShortenedUrl } from '../types';
import { addUrl } from '../services/urlStore';
import { Plus, Trash2, Copy, Check, ExternalLink } from 'lucide-react';

const HomePage: React.FC = () => {
  const [inputs, setInputs] = useState<UrlInput[]>([{ id: 1, longUrl: '', shortcode: '', validity: '30' }]);
  const [results, setResults] = useState<Record<number, ShortenedUrl | null>>({});
  const [errors, setErrors] = useState<Record<number, string | null>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleInputChange = (id: number, field: keyof Omit<UrlInput, 'id'>, value: string) => {
    setInputs(inputs.map(input => input.id === id ? { ...input, [field]: value } : input));
    if (errors[id]) {
        setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { id: Date.now(), longUrl: '', shortcode: '', validity: '30' }]);
    }
  };

  const removeInput = (id: number) => {
    setInputs(inputs.filter(input => input.id !== id));
    setResults(prev => { const newResults = {...prev}; delete newResults[id]; return newResults; });
    setErrors(prev => { const newErrors = {...prev}; delete newErrors[id]; return newErrors; });
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setResults({});

    const newErrors: Record<number, string | null> = {};
    let hasError = false;

    inputs.forEach(input => {
        if (!input.longUrl.trim()) {
            newErrors[input.id] = "Original URL cannot be empty.";
            hasError = true;
        } else if (!validateUrl(input.longUrl)) {
            newErrors[input.id] = "Please enter a valid URL (e.g., https://example.com).";
            hasError = true;
        }
    });

    if (hasError) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
    }

    const promises = inputs.map(input => 
      addUrl(input.longUrl, input.shortcode, parseInt(input.validity, 10) || 0)
        .then(res => ({id: input.id, status: 'fulfilled', value: res}))
        .catch(err => ({id: input.id, status: 'rejected', reason: err}))
    );
    
    const outcomes = await Promise.all(promises);

    const newResults: Record<number, ShortenedUrl | null> = {};
    const finalErrors: Record<number, string | null> = {};

    outcomes.forEach(outcome => {
        if(outcome.status === 'fulfilled') {
            newResults[outcome.id] = outcome.value;
        } else {
            finalErrors[outcome.id] = outcome.reason instanceof Error ? outcome.reason.message : 'An unknown error occurred.';
        }
    });

    setResults(newResults);
    setErrors(finalErrors);
    setIsLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  }

  const getShortUrl = (shortcode: string) => `${window.location.origin}${window.location.pathname}#/r/${shortcode}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text">Create Short Links</h1>
        <p className="mt-2 text-brand-subtle">Shorten up to 5 URLs at once. Customize your links as you wish.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {inputs.map((input, index) => (
          <div key={input.id} className="p-4 bg-brand-primary rounded-lg border border-brand-subtle/50 relative">
            {inputs.length > 1 && (
              <button
                type="button"
                onClick={() => removeInput(input.id)}
                className="absolute top-2 right-2 p-1 text-brand-subtle hover:text-red-500 transition-colors"
                aria-label="Remove URL"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor={`longUrl-${input.id}`} className="block text-sm font-medium text-gray-300 mb-1">Original URL*</label>
                <input
                  id={`longUrl-${input.id}`}
                  type="url"
                  value={input.longUrl}
                  onChange={(e) => handleInputChange(input.id, 'longUrl', e.target.value)}
                  placeholder="https://your-very-long-url.com/goes-here"
                  className="w-full bg-brand-secondary border border-brand-subtle/50 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor={`shortcode-${input.id}`} className="block text-sm font-medium text-gray-300 mb-1">Custom Shortcode (Optional)</label>
                <input
                  id={`shortcode-${input.id}`}
                  type="text"
                  value={input.shortcode}
                  onChange={(e) => handleInputChange(input.id, 'shortcode', e.target.value)}
                  placeholder="e.g., my-link"
                  className="w-full bg-brand-secondary border border-brand-subtle/50 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor={`validity-${input.id}`} className="block text-sm font-medium text-gray-300 mb-1">Validity in Minutes (Optional)</label>
                <input
                  id={`validity-${input.id}`}
                  type="number"
                  min="0"
                  value={input.validity}
                  onChange={(e) => handleInputChange(input.id, 'validity', e.target.value)}
                  placeholder="30 (0 for permanent)"
                  className="w-full bg-brand-secondary border border-brand-subtle/50 rounded-md px-3 py-2 text-brand-text focus:ring-2 focus:ring-brand-accent focus:outline-none"
                />
              </div>
            </div>
            {errors[input.id] && <p className="mt-2 text-sm text-red-400">{errors[input.id]}</p>}
          </div>
        ))}

        <div className="flex justify-between items-start gap-4">
          <button
            type="button"
            onClick={addInput}
            disabled={inputs.length >= 5}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-brand-primary hover:bg-opacity-80 text-brand-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} /> Add URL
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-base font-semibold rounded-md bg-brand-accent hover:bg-brand-accent-hover text-white disabled:opacity-50 disabled:cursor-wait transition-transform transform hover:scale-105"
          >
            {isLoading ? 'Shortening...' : 'Shorten URLs'}
          </button>
        </div>
      </form>
      
      {Object.values(results).some(r => r) && (
        <div className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold text-brand-text">Your Links are Ready!</h2>
            {Object.entries(results).map(([id, result]) => result && (
                <div key={id} className="bg-brand-primary rounded-lg p-4 border border-brand-subtle/50">
                    <p className="text-sm text-brand-subtle truncate mb-2" title={result.longUrl}>From: {result.longUrl}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <a href={getShortUrl(result.shortcode)} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-brand-accent hover:underline">
                            {getShortUrl(result.shortcode).replace('https://', '').replace('http://', '')}
                        </a>
                        <div className="flex items-center gap-2">
                           <a href={result.longUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-brand-subtle hover:text-brand-text transition-colors" title="Test Original URL">
                             <ExternalLink size={18} />
                           </a>
                           <button onClick={() => handleCopy(getShortUrl(result.shortcode))} className="p-2 text-brand-subtle hover:text-brand-text transition-colors" title="Copy Short URL">
                             {copied === getShortUrl(result.shortcode) ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                           </button>
                        </div>
                    </div>
                    <p className="text-xs text-brand-subtle mt-2">
                        Expires: {result.expiresAt ? new Date(result.expiresAt).toLocaleString() : 'Never'}
                    </p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;