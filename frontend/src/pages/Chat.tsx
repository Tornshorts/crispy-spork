import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  'Give me a full spending overview',
  'What are my top 5 expenses?',
  'How much Fuliza did I use?',
  'How can I save money?',
  'Show spending by category',
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideReasoning, setHideReasoning] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat(text.trim());
      let answer = res.answer;

      // Optionally strip reasoning blocks (text between <think>...</think> or similar)
      if (hideReasoning) {
        answer = answer.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        answer = answer.replace(/\*\*Reasoning:\*\*[\s\S]*?(?=\n\n|\n\*\*|$)/gi, '').trim();
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="chat-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>AI Finance Chat</h2>
          <p>Ask me anything about your M-PESA finances</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setHideReasoning(!hideReasoning)}
          style={{ fontSize: 12, padding: '6px 12px' }}
        >
          {hideReasoning ? <EyeOff size={14} /> : <Eye size={14} />}
          {hideReasoning ? 'Show Reasoning' : 'Hide Reasoning'}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Bot size={48} style={{ color: 'var(--color-primary)', marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              Hi! I'm your M-PESA Financial Advisor 🤖
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>
              Ask me anything about your spending, or try one of these:
            </p>
            <div className="suggested-prompts" style={{ justifyContent: 'center' }}>
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-accent)',
              color: '#fff',
              flexShrink: 0,
            }}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`chat-bubble ${m.role}`}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-accent)',
              color: '#fff',
              flexShrink: 0,
            }}>
              <Bot size={16} />
            </div>
            <div className="chat-bubble assistant">
              <div className="spinner" style={{ width: 18, height: 18 }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (when there are messages) */}
      {messages.length > 0 && !loading && (
        <div className="suggested-prompts">
          {SUGGESTED.slice(0, 3).map((s) => (
            <button key={s} onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Ask about your finances…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
