/**
 * src/components/AvatarUpload.tsx
 *
 * Displays a circular avatar preview (or initials fallback) and lets
 * the user pick a profile picture. Extracted from Register so the page
 * stays clean and this widget can be reused on a profile-edit page.
 */

import { useRef } from 'react';

interface AvatarUploadProps {
  preview: string | null;
  initials: string;
  onChange: (file: File) => void;
}

export default function AvatarUpload({ preview, initials, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}
    >
      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile picture"
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          border: '2px dashed var(--clr-border)',
          background: preview ? 'transparent' : 'var(--clr-navy)',
          color: '#fff',
          fontSize: '1.5rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'border-color var(--transition)',
          padding: 0,
        }}
        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--clr-gold)')}
        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--clr-border)')}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials || '?'
        )}
      </button>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--clr-gold)',
          fontSize: '.8125rem',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        {preview ? 'Change photo' : 'Add profile picture (optional)'}
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  );
}
