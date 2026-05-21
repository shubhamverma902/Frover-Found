'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { Attachment } from '@/constants/dashboard-pages';

const MAX_FILES   = 5;
const ACCEPT_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

const fmtBytes = (n: number) => {
  if (n < 1024)           return `${n} B`;
  if (n < 1024 * 1024)    return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const isImage = (mime: string) => mime.startsWith('image/');

interface LightboxProps {
  attachments: Attachment[];
  index:       number;
  onClose:     () => void;
  onChange:    (i: number) => void;
}

const Lightbox = ({ attachments, index, onClose, onChange }: LightboxProps) => {
  const att = attachments[index];

  const prev = useCallback(() => onChange((index - 1 + attachments.length) % attachments.length), [index, attachments.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % attachments.length), [index, attachments.length, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // images only — PDFs open in new tab, so this component only receives image attachments as index
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white border border-white/15 hover:border-white/40 transition-colors text-sm z-10"
      >
        ✕
      </button>

      {/* prev arrow */}
      {attachments.length > 1 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white border border-white/15 hover:border-white/40 transition-colors z-10"
        >
          ‹
        </button>
      )}

      {/* image */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={att.url}
          alt={att.originalName}
          className="max-w-[90vw] max-h-[75vh] object-contain border border-white/10 shadow-2xl"
        />
        <div className="flex items-center gap-3">
          <p className="text-xs text-white/60 truncate max-w-[40ch]">{att.originalName}</p>
          <span className="text-[10px] text-white/30">·</span>
          <p className="text-[10px] text-white/40 shrink-0">{fmtBytes(att.size)}</p>
          {attachments.length > 1 && (
            <>
              <span className="text-[10px] text-white/30">·</span>
              <p className="text-[10px] text-white/40 shrink-0">{index + 1} / {attachments.length}</p>
            </>
          )}
          <a
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#E4BC62]/60 hover:text-[#E4BC62] underline underline-offset-2 transition-colors shrink-0"
            onClick={e => e.stopPropagation()}
          >
            open ↗
          </a>
        </div>
      </div>

      {/* next arrow */}
      {attachments.length > 1 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white border border-white/15 hover:border-white/40 transition-colors z-10"
        >
          ›
        </button>
      )}
    </div>
  );
};

interface Props {
  attachments: Attachment[];
  uploading:   boolean;
  uploadError: string;
  onUpload:    (files: File[]) => void;
  onDelete:    (id: string) => void;
}

export const AttachmentsPanel = ({ attachments, uploading, uploadError, onUpload, onDelete }: Props) => {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [isDrag, setIsDrag]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // only image attachments are lightbox-able; compute their indices within the full list
  const imageAttachments = attachments.filter(a => isImage(a.mimetype));

  const openLightbox = (att: Attachment) => {
    const i = imageAttachments.findIndex(a => a._id === att._id);
    if (i !== -1) setLightboxIndex(i);
  };

  const canUpload = !uploading && attachments.length < MAX_FILES;

  const handleFiles = (list: FileList | null) => {
    if (!list || !canUpload) return;
    const valid = Array.from(list)
      .filter(f => ACCEPT_MIME.includes(f.type))
      .slice(0, MAX_FILES - attachments.length);
    if (valid.length > 0) onUpload(valid);
  };

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          attachments={imageAttachments}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}

      <div className="space-y-3">

        {/* Section label */}
        <div className="flex items-center gap-2">
          <span className="text-[#E4BC62]/50 text-[9px]">◈</span>
          <p className="text-[10px] font-bold text-[#DDDED9]/50 uppercase tracking-[0.35em]">Attachments</p>
          <span className="text-[9px] text-[#DDDED9]/25 border border-[#DDDED9]/15 px-1.5 py-0.5 ml-0.5">
            {attachments.length}/{MAX_FILES}
          </span>
        </div>

        {/* Drop zone */}
        {canUpload && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            onDragEnter={e  => { e.preventDefault(); setIsDrag(true); }}
            onDragOver={e   => e.preventDefault()}
            onDragLeave={()  => setIsDrag(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDrag(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={[
              'flex flex-col items-center justify-center gap-1.5 p-5 border-2 border-dashed cursor-pointer transition-colors select-none outline-none',
              isDrag
                ? 'border-[#E4BC62]/50 bg-[#E4BC62]/5'
                : 'border-[#DDDED9]/15 hover:border-[#DDDED9]/30 hover:bg-[#DDDED9]/3',
            ].join(' ')}
          >
            <span className={`text-xl transition-colors leading-none ${isDrag ? 'text-[#E4BC62]' : 'text-[#DDDED9]/25'}`}>
              ↑
            </span>
            <p className="text-xs font-semibold text-[#DDDED9]/45">
              {isDrag ? 'Release to upload' : 'Drop files here'}
            </p>
            <p className="text-[10px] text-[#DDDED9]/30">
              or <span className="text-[#E4BC62]/60 underline underline-offset-2">click to browse</span>
            </p>
            <p className="text-[9px] text-[#DDDED9]/20 mt-0.5">
              JPG · PNG · WebP · PDF · Max 10 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              multiple
              className="hidden"
              onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
            />
          </div>
        )}

        {/* Upload progress / error feedback */}
        {uploading && (
          <p className="text-[10px] text-[#E4BC62]/60 text-center animate-pulse">Uploading…</p>
        )}
        {!uploading && uploadError && (
          <p className="text-[10px] text-red-400 text-center">{uploadError}</p>
        )}

        {/* File list */}
        {attachments.length > 0 && (
          <div className="space-y-1.5">
            {attachments.map(att => (
              <div key={att._id} className="flex items-center gap-2.5 px-3 py-2 bg-[#23292E] border border-[#DDDED9]/10">

                {/* Thumbnail / icon — clickable for images */}
                {isImage(att.mimetype) ? (
                  <button
                    type="button"
                    onClick={() => openLightbox(att)}
                    className="shrink-0 w-9 h-9 overflow-hidden border border-[#DDDED9]/10 hover:border-[#E4BC62]/40 transition-colors group relative"
                    title="Preview"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.originalName}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]">⊕</span>
                  </button>
                ) : (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="shrink-0 w-9 h-9 flex items-center justify-center bg-red-900/20 border border-red-900/30 hover:border-red-500/50 hover:bg-red-900/30 transition-colors"
                    title="Open PDF"
                  >
                    <span className="text-[9px] font-black text-red-400/70 leading-none">PDF</span>
                  </a>
                )}

                {/* Name + size */}
                <div className="flex-1 min-w-0">
                  {isImage(att.mimetype) ? (
                    <button
                      type="button"
                      onClick={() => openLightbox(att)}
                      className="text-xs font-semibold text-[#DDDED9]/80 truncate block hover:text-[#E4BC62] transition-colors text-left w-full"
                    >
                      {att.originalName}
                    </button>
                  ) : (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-semibold text-[#DDDED9]/80 truncate block hover:text-[#E4BC62] transition-colors"
                    >
                      {att.originalName} ↗
                    </a>
                  )}
                  <p className="text-[9px] text-[#DDDED9]/30 mt-0.5">{fmtBytes(att.size)}</p>
                </div>

                {/* Delete — inline confirm */}
                {pendingDelete === att._id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPendingDelete(null)}
                      className="px-1.5 py-1 text-[10px] text-[#DDDED9]/40 hover:text-[#DDDED9] border border-[#DDDED9]/15 transition-colors"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => { onDelete(att._id); setPendingDelete(null); }}
                      disabled={uploading}
                      className="px-1.5 py-1 text-[10px] font-bold text-red-400 border border-red-700/40 hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      Yes
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPendingDelete(att._id)}
                    disabled={uploading}
                    className="shrink-0 w-6 h-6 flex items-center justify-center text-[#DDDED9]/25 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40 text-[10px] leading-none"
                    title="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cap reached */}
        {attachments.length >= MAX_FILES && (
          <p className="text-[10px] text-[#DDDED9]/25 text-center">
            Maximum {MAX_FILES} files per record
          </p>
        )}
      </div>
    </>
  );
};
