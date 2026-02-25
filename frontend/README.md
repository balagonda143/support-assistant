## Frontend – Support Assistant

React + Vite single‑page app that provides the chat interface for the Support Assistant backend.

### Tech stack
- **Framework**: React (with Vite)
- **Styling**: Custom CSS for a compact, dark chat UI

### Features
- **Chat interface** with user/assistant bubbles and typing indicator.
- **Suggested questions** to quickly try the assistant.
- **Session management** using a UUID stored in `localStorage`, with a **New Chat** button to start a new conversation.
- **Conversation history** loaded from the backend per session.

### Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the URL printed by Vite (default `http://localhost:5173`).

Make sure the backend is running (default `http://localhost:3001`) so the chat can reach the API at `http://localhost:3001/api`.

### Configuration
- The API base URL is defined in `src/components/ChatScreen.jsx` as `API = 'http://localhost:3001/api'`.
- Change this constant if your backend runs on a different host or port.

