import { useState } from 'react';
import { LogIn, Shield } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 12 }}>💸</div>
        <h1>MPESA Finance Tracker</h1>
        <p className="subtitle">Understand where your M-PESA money goes</p>

        {/* How it works */}
        <div style={{
          margin: '20px 0',
          padding: '16px 20px',
          borderRadius: 12,
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--color-text)' }}>How it works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              { icon: '📥', text: 'Download your M-PESA statement from Safaricom' },
              { icon: '📤', text: 'Upload it here (PDF or CSV)' },
              { icon: '📊', text: 'We automatically analyze your spending' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            <LogIn size={16} />
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={onLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Continue without saving →
          </button>
        </div>

        {/* Trust signals */}
        <div style={{
          marginTop: 20,
          padding: '14px 16px',
          borderRadius: 10,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>Your data is stored locally on your device</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>We never access your M-PESA account</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>We only analyze statements you upload</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
