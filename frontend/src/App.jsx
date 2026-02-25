import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatScreen from './components/ChatScreen';
import './App.css';

export default function App() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('sessionId', id);
    }
    setSessionId(id);
  }, []);

  const newChat = () => {
    const id = uuidv4();
    localStorage.setItem('sessionId', id);
    setSessionId(id);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">✦</div>
          <h1>Support Assistant</h1>
        </div>
        <div className="header-right">
          <span className="session-label">Session: {sessionId?.slice(0, 8)}...</span>
          <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>
        </div>
      </header>
      {sessionId && <ChatScreen sessionId={sessionId} />}
    </div>
  );
}