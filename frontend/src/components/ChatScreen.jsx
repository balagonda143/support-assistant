import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:3001/api';

const SUGGESTIONS = [
  "How do I reset my password?",
  "What is your refund policy?",
  "How to enable 2FA?",
  "Tell me about subscription plans",
  "How do I delete my account?",
];

export default function ChatScreen({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef();
  const inputRef = useRef();

  // Load existing conversation on session change
  useEffect(() => {
    setMessages([]);
    fetch(`${API}/conversations/${sessionId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => setError('Failed to load conversation.'));
  }, [sessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setError('');

    // Optimistically add user message
    const userMsg = {
      role: 'user',
      content: msg,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: msg }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        created_at: new Date().toISOString(),
        tokensUsed: data.tokensUsed
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      setError(err.message || 'Failed to get response.');
      setMessages(prev => prev.slice(0, -1)); // remove optimistic message
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-container">
      {/* Messages area */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✦</div>
            <h2>How can I help you today?</h2>
            <p>I answer based on our product documentation only.</p>
            <div className="suggestions">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`message-row ${m.role}`}>
            <div className={`avatar ${m.role}`}>
              {m.role === 'user' ? 'U' : '✦'}
            </div>
            <div className="message-content">
              <div className={`bubble ${m.role}`}>
                {m.content}
              </div>
              <div className="meta">
                {formatTime(m.created_at)}
                {m.tokensUsed && <span> · {m.tokensUsed} tokens</span>}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message-row assistant">
            <div className="avatar assistant">✦</div>
            <div className="message-content">
              <div className="bubble assistant typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-banner">⚠ {error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask a question about our product..."
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => send()}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
        <p className="footer-note">Answers based only on verified product documentation</p>
      </div>
    </div>
  );
}