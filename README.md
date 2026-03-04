# 💸 MPESA Finance Tracker AI

An AI-powered personal finance dashboard that parses M-PESA statements and provides intelligent spending insights, Fuliza analytics, and an interactive AI chat advisor.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss)

---

## ✨ Features

- **📤 Statement Upload** — Upload M-PESA PDF/CSV statements; transactions are parsed automatically
- **📊 Dashboard** — KPI cards (inflow, outflow, net, Fuliza), spending-by-category chart, top expenses
- **💳 Transaction Explorer** — Paginated, filterable, searchable transaction list
- **🏦 Fuliza Analytics** — Usage vs repayment ratio with a timeline chart
- **🤖 AI Chat** — Ask questions about your finances powered by Groq LLaMA 3.3 70B via LangChain

---

## 🏗 Tech Stack

| Layer     | Technology                                 |
| --------- | ------------------------------------------ |
| Frontend  | React 19, TypeScript, Vite, Tailwind CSS 4, Recharts |
| Backend   | FastAPI, SQLAlchemy, Alembic, LangChain    |
| AI / LLM  | Groq (LLaMA 3.3 70B)                      |
| Database  | SQLite (local) / PostgreSQL (production)   |

---

## 📂 Project Structure

```
mpesa_tracker/
├── backend/
│   ├── api.py              # FastAPI REST endpoints
│   ├── main.py             # CLI entry point
│   ├── agents/             # LangChain AI agent
│   ├── database/           # SQLAlchemy models, session, repository
│   ├── helpers/            # PDF/CSV parser
│   ├── services/           # Analytics service
│   ├── tools/              # LangChain agent tools
│   ├── migrations/         # Alembic migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Transactions, Fuliza, Chat, Upload
│   │   ├── components/     # Shared UI components
│   │   ├── lib/            # API client & helpers
│   │   └── context/        # React context providers
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── .gitignore
```

---

## 🚀 Local Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
echo 'GROQ_API_KEY="your_groq_api_key_here"' > .env

# Run the API server
uvicorn api:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env  (empty for local dev since Vite proxies to :8000)
echo 'VITE_API_BASE_URL=' > .env

npm run dev
```

Open **http://localhost:5173** and upload your M-PESA statement!

---

## ☁️ Deployment

### Frontend → Vercel


## 📝 API Endpoints

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/upload`        | Upload M-PESA PDF/CSV          |
| GET    | `/api/summary`       | Dashboard KPI summary          |
| GET    | `/api/categories`    | Spending by category           |
| GET    | `/api/top-expenses`  | Top N largest expenses         |
| GET    | `/api/transactions`  | Paginated transaction list     |
| GET    | `/api/fuliza`        | Fuliza usage analytics         |
| POST   | `/api/chat`          | AI chat with financial advisor |

---

## 📄 License

MIT
