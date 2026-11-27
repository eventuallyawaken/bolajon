import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { processAvatarFile, AvatarValidationError } from '@/shared/lib/imageProcessor';
import { useT } from '@/shared/i18n';
import { UserAvatar } from './UserAvatar';
import { Button } from './Button';

interface AvatarDropzoneProps {
  fullName?: string | null;
  avatarUrl?: string | null;
  isSaving?: boolean;
  onUpload: (dataUrl: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export const AvatarDropzone: React.FC<AvatarDropzoneProps> = ({
  fullName,
  avatarUrl,
  isSaving = false,
  onUpload,
  onRemove,
}) => {
  const { t } = useT();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    try {
      setIsProcessing(true);
      const compressedDataUrl = await processAvatarFile(file);
      await onUpload(compressedDataUrl);
    } catch (err) {
      if (err instanceof AvatarValidationError) {
        if (err.code === 'INVALID_TYPE') {
          toast.error(t('avatar.errType'));
        } else if (err.code === 'FILE_TOO_LARGE') {
          toast.error(t('avatar.errSize'));
        } else {
          toast.error(t('avatar.errProcess'));
        }
      } else {
        toast.error(t('avatar.errProcess'));
      }
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isSaving || isProcessing) return;
    const droppedFile = e.dataTransfer.files?.[0];
    void handleFile(droppedFile);
  };

  const busy = isSaving || isProcessing;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 20,
        alignItems: 'center',
        background: 'var(--bg-canvas)',
        padding: 18,
        borderRadius: 12,
        border: '1px solid var(--border-light)',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <UserAvatar fullName={fullName} avatarUrl={avatarUrl} size={86} />
        {avatarUrl && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void onRemove()}
            style={{ fontSize: 11.5, color: 'var(--danger-text)', padding: '4px 10px' }}
          >
            {t('avatar.remove')}
          </Button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDragging) setIsDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : 'var(--border-color)'}`,
          background: isDragging ? 'rgba(59, 130, 246, 0.06)' : 'var(--bg-surface)',
          borderRadius: 14,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 6,
          transition: 'all 0.15s ease',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>

        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {busy ? t('avatar.uploading') : t('avatar.dragDrop')}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{t('avatar.or')}</div>

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          style={{
            marginTop: 2,
            padding: '7px 24px',
            borderRadius: 8,
            background: '#2f80ed',
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 600,
            border: 'none',
            cursor: busy ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(47, 128, 237, 0.25)',
          }}
        >
          {t('avatar.browse')}
        </button>

        <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
          {t('avatar.hint')}
        </div>
      </div>
    </div>
  );
};
