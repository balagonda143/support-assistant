## Support Assistant

A small full‑stack demo that exposes a **product support chat assistant**. The assistant answers questions only from curated documentation and stores conversations in SQLite.

### Tech stack
- **Frontend**: React (Vite), modern single‑page chat UI
- **Backend**: Node.js, Express 5, Groq LLM API
- **Database**: SQLite via `better-sqlite3`

### Project structure
- **frontend/**: React app with chat interface and session management.
- **backend/**: REST API, LLM integration, and SQLite persistence.

### Prerequisites
- **Node.js**: v18+ recommended
- **npm**: bundled with Node
- **Groq API key**: set as `GROQ_API_KEY` in the backend `.env`

### Getting started
1. **Start the backend**
   - `cd backend`
   - `npm install`
   - Create a `.env` file:
     - `GROQ_API_KEY=your_groq_api_key`
     - Optional: `DB_PATH=./support.db`, `PORT=3001`
   - Run: `node server.js` (or `npx nodemon server.js`)

2. **Start the frontend**
   - Open a new terminal.
   - `cd frontend`
   - `npm install`
   - Run: `npm run dev`
   - Open the URL printed by Vite (by default `http://localhost:5173`).

### How it works
- **Docs‑only answers**: The backend loads product docs from `backend/docs.json`. The LLM is instructed to answer **only** using this content and to decline anything not covered.
- **Sessions & history**: Each browser gets a UUID session stored in `localStorage`. Messages are saved in SQLite so you can reload and continue a conversation.
- **APIs**: The frontend talks to the backend at `http://localhost:3001/api` for chatting and fetching past conversations.

