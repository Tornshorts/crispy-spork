import { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import { api, type UploadResult } from '../lib/api';

export default function UploadPage() {
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.upload(file);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <div className="page-header">
        <h2>Upload Statement</h2>
        <p>Import your M-PESA PDF or CSV statement to analyze your finances</p>
      </div>

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div
          className={`upload-zone ${dragover ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div className="spinner" />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Processing your statement…</p>
            </div>
          ) : (
            <>
              <Upload size={40} style={{ color: 'var(--color-primary)', marginBottom: 12 }} />
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                Drop your file here or click to browse
              </p>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Supports .pdf and .csv files
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv"
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />

        {/* Result */}
        {result && (
          <div style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 700, color: '#10b981' }}>Import Successful</span>
            </div>
            <p style={{ fontSize: 14, marginBottom: 6 }}>{result.message}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <span>✅ Imported: <strong>{result.imported}</strong></span>
              <span>⏭️ Skipped: <strong>{result.skipped}</strong></span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 24,
            padding: 20,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <XCircle size={20} style={{ color: '#ef4444' }} />
              <span style={{ fontWeight: 700, color: '#ef4444' }}>Upload Failed</span>
            </div>
            <p style={{ fontSize: 14, marginTop: 8 }}>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
