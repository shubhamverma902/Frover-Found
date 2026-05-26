'use client';

import { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { useGeneratePublicSlugMutation, useGetSettingsQuery } from '@/store/api';

export const ShareWeddingSection = () => {
  const { data: settings } = useGetSettingsQuery();
  const [generateSlug, { isLoading }] = useGeneratePublicSlugMutation();
  const [localSlug, setLocalSlug] = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);

  const slug = localSlug ?? settings?.publicSlug ?? null;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = slug ? `${origin}/wedding/${slug}` : null;

  const handleGenerate = async () => {
    setError(null);
    try {
      const result = await generateSlug().unwrap();
      setLocalSlug(result.slug);
    } catch {
      setError('Could not generate link. Please try again.');
    }
  };

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SettingsSection icon="🔗" title="Share Your Wedding Page">
      <div className="space-y-4">
        <p className="text-sm text-zinc-500 dark:text-silver/60 max-w-lg">
          Create a beautiful public page your guests can visit to see your wedding details —
          names, date, venue, and city. No login required.
        </p>

        {!url ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2 bg-gold text-dark text-sm font-semibold hover:bg-[#d4ac52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Generating…' : 'Get My Wedding Link'}
            </button>
            {error && (
              <p role="alert" className="text-xs text-red-500">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-0 flex items-center gap-2 bg-zinc-100 dark:bg-[#1a1f23] border border-zinc-200 dark:border-[#2a2f33] px-3 py-2">
                <span className="text-sm text-zinc-600 dark:text-silver/70 truncate flex-1">{url}</span>
              </div>
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Copied' : 'Copy link'}
                className="shrink-0 px-4 py-2 border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy Link'}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open wedding page in new tab"
                className="shrink-0 px-4 py-2 bg-gold text-dark text-sm font-semibold hover:bg-[#d4ac52] transition-colors"
              >
                Preview
              </a>
            </div>
            <p className="text-xs text-zinc-400 dark:text-silver/40">
              Share this link with your guests — it shows your wedding details publicly.
            </p>
          </div>
        )}
      </div>
    </SettingsSection>
  );
};
