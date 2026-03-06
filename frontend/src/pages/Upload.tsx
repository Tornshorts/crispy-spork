import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, Lock } from 'lucide-react';
import { api, type UploadResult } from '../lib/api';

export default function UploadPage() {
  const [dragover, setDragover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = async (file: File, pwd?: string) => {
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.upload(file, pwd);
      setResult(res);
      setNeedsPassword(false);
      setPendingFile(null);
      setPassword('');
      // Redirect to dashboard after a brief delay
      setTimeout(() => navigate('/'), 1500);
    } catch (e: any) {
      let msg = '';
      try {
        const parsed = JSON.parse(e.message);
        msg = parsed.detail || e.message;
      } catch {
        msg = e.message || 'Upload failed';
      }

      // If the server says it needs a password (422) or wrong password (401)
      if (
        msg.toLowerCase().includes('password') ||
        msg.toLowerCase().includes('decrypt') ||
        msg.toLowerCase().includes('encrypted')
      ) {
        setNeedsPassword(true);
        setPendingFile(file);
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingFile && password) {
      handleFile(pendingFile, password);
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

        {/* Password prompt for encrypted PDFs */}
        {needsPassword && (
          <form
            onSubmit={handlePasswordSubmit}
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 12,
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Lock size={20} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>Password Required</span>
            </div>
            <p style={{ fontSize: 14, marginBottom: 14, color: 'var(--color-text-secondary)' }}>
              This M-PESA statement is encrypted. Enter your password to unlock it.
              <br />
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                (Usually your national ID number)
              </span>
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter statement password"
                autoFocus
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!password || uploading}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: password ? 'pointer' : 'not-allowed',
                  opacity: password ? 1 : 0.5,
                }}
              >
                {uploading ? 'Unlocking…' : 'Unlock & Import'}
              </button>
            </div>
          </form>
        )}

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

        {/* Error (only show if NOT the password prompt) */}
        {error && !needsPassword && (
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
