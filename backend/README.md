## Backend – Support Assistant

Node.js + Express API that connects to the Groq LLM, restricts it to your product docs, and stores chat history in SQLite.

### Tech stack
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: SQLite via `better-sqlite3`
- **LLM**: Groq (`llama-3.3-70b-versatile`)

### Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file in `backend/`:
   - `GROQ_API_KEY=your_groq_api_key` **(required)**
   - `DB_PATH=./support.db` (optional, default as shown)
   - `PORT=3001` (optional, default 3001)
4. Start the server:
   - `node server.js`  
   - or `npx nodemon server.js`

On start, the app will create the SQLite database (if it doesn’t exist) with `sessions` and `messages` tables and log the DB path.

### API overview
- **GET `/api/test-key`**
  - Quick check that `GROQ_API_KEY` works.
  - Returns `{ success, reply | error }`.

- **POST `/api/chat`**
  - Body: `{ "sessionId": string, "message": string }`
  - Uses recent messages from that session plus docs from `docs.json` to generate a reply.
  - Response: `{ "reply": string, "tokensUsed": number }`.

- **GET `/api/conversations/:sessionId`**
  - Returns all messages for a session ordered by time.

- **GET `/api/sessions`**
  - Lists all sessions ordered by most recently updated.

### Documentation grounding
- Product docs live in `docs.json`.
- The system prompt forces the model to:
  - Answer only from those docs.
  - Reply with `Sorry, I don't have information about that.` when content is missing.

