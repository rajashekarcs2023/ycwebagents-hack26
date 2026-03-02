# Calex AI

**Autonomous AI DevRel Agent for Developer Tools Startups**

> One AI agent that replaces your first DevRel hire. Answers developer questions, manages community, handles email outreach, scores leads, and creates content — 24/7 across every channel.

![Python](https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js_16-React_19-000?logo=next.js)
![OpenAI](https://img.shields.io/badge/GPT--4o-OpenAI-412991?logo=openai)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwindcss)

---

## The Problem

Hiring a DevRel costs **$200–500K/year**, takes 3–6 months to ramp, and most early-stage startups can't afford one. Meanwhile, developer questions go unanswered, community engagement drops, and leads slip through the cracks.

## The Solution

Calex is a single AI agent that operates across **Discord, Slack, Web Widget, Email, Phone, and LinkedIn** — autonomously answering questions, nurturing leads, and creating content.

---

## Features

| Feature | Description |
|---------|-------------|
| 🔮 **Embeddable Widget** | Inject a chat widget on any docs site with voice-narrated walkthroughs (MiniMax TTS) |
| 💬 **Discord Bot** | Live Q&A bot that answers from your knowledge base with auto-escalation |
| 📧 **AI Email Inbox** | Dedicated inbox (AgentMail) with LLM-powered auto-reply |
| 📞 **Phone Agent** | Vapi-powered voice agent that collects leads and answers questions |
| 🌐 **Live Browser Research** | Visible browser automation scanning GitHub, Reddit, HN for leads |
| 📝 **LinkedIn Content** | Auto-generates posts from community activity, one-click publish |
| 🎯 **Lead Intelligence** | Extracts and scores leads from conversations, suggests follow-ups |
| 📊 **Dashboard** | Real-time activity feed, metrics, internal chat, email composer |
| 🚀 **Onboarding Wizard** | 4-step setup: company info → docs → integrations → deploy |

---

## Architecture

```
  Discord · Slack · Widget · Email · Phone
                    │
              ┌─────▼─────┐
              │  FastAPI   │
              │  Backend   │
              └─────┬─────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
  OpenAI       Supermemory    Services
  GPT-4o       (Knowledge)   ├─ AgentMail
  (LLM)                      ├─ Browser Use
                              ├─ MiniMax TTS
                              ├─ Vapi
                              ├─ Discord.py
                              └─ Composio
                    │
              ┌─────▼─────┐
              │  Next.js   │
              │  Frontend  │
              └───────────┘
```

---

## Tech Stack
<img width="1312" height="975" alt="Screenshot 2026-03-01 at 1 40 57 PM" src="https://github.com/user-attachments/assets/fcf3493b-fb3e-4402-b1b6-57e607e9491e" />


## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- pnpm

### 1. Clone & Setup Environment

```bash
git clone https://github.com/rajashekarcs2023/ycwebagents-hack26.git
cd ycwebagents-hack26
cp .env.example .env
# Fill in your API keys (see Environment Variables below)
```

### 2. Start Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8000`

### 3. Start Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at `http://localhost:3000`

### 4. Onboard a Company

1. Go to `http://localhost:3000/app/onboarding`
2. Enter company name, website, and docs URL
3. Configure integrations (Discord, Slack, etc.)
4. Deploy — your agent is live!

---

## Environment Variables

```env
# LLM
OPENAI_API_KEY=           # GPT-4o for Q&A, content, lead scoring

# Knowledge Base
SUPERMEMORY_API_KEY=      # Semantic search over company docs

# Email
AGENTMAIL_API_KEY=        # AI email inbox + auto-reply

# Phone
VAPI_API_KEY=             # Voice agent with lead collection

# Voice Narration
MINIMAX_API_KEY=          # Text-to-speech for walkthroughs
MINIMAX_GROUP_ID=         # MiniMax account group

# Community
DISCORD_BOT_TOKEN=        # Discord bot for live Q&A
SLACK_BOT_TOKEN=          # Slack message fetching

# Integrations
COMPOSIO_API_KEY=         # LinkedIn posting (OAuth)
BROWSER_USE_API_KEY=      # Browser automation for research

# Optional
DEDALUS_API_KEY=          # Provider-agnostic LLM orchestration
```

---

## Project Structure

```
├── backend/
│   ├── main.py                 # FastAPI server (1150+ lines, 20+ endpoints)
│   ├── models.py               # Pydantic models
│   ├── db.py                   # In-memory database
│   └── services/
│       ├── llm.py              # LLM client (OpenAI/Dedalus) — Q&A, LinkedIn, leads
│       ├── agentmail_client.py # Email inbox management
│       ├── browser_use_client.py # Web scraping & research
│       ├── discord_bot.py      # Discord Q&A bot
│       ├── slack_client.py     # Slack message fetching
│       ├── vapi_client.py      # Phone agent setup
│       ├── minimax_tts.py      # Voice narration
│       ├── supermemory_client.py # Knowledge base
│       ├── composio_client.py  # LinkedIn/OAuth tools
│       ├── discord_webhook.py  # Discord notifications
│       └── llms_txt_crawler.py # Auto-ingest docs via llms.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── app/page.tsx        # Dashboard (command center)
│   │   ├── app/onboarding/     # Onboarding wizard
│   │   ├── widget/[slug]/      # Embeddable widget page
│   │   ├── help/[slug]/        # Public help page
│   │   ├── embed/              # Embed distribution page
│   │   └── demo/               # Demo page
│   ├── components/
│   │   ├── calex-widget-chat.tsx  # Widget chat component
│   │   ├── activity-feed.tsx      # Real-time activity feed
│   │   ├── activity-item.tsx      # Expandable activity items
│   │   ├── metric-card.tsx        # Dashboard metric cards
│   │   └── onboarding-wizard.tsx  # Multi-step onboarding
│   ├── lib/api.ts              # API client (350+ lines)
│   └── public/embed.js         # Injectable widget script
│
├── PROJECT_RESUME.md           # Detailed project resume
├── DEMO_SCRIPT.md              # Demo presentation script
├── architecture.html           # Visual architecture diagram
└── demo_leads_sheet.csv        # Sample leads data
```

---

## API Highlights

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/onboard` | Onboard a new company |
| `POST` | `/api/widget/ask` | Widget Q&A (answer + show-me mode) |
| `POST` | `/api/demo/community_event` | Simulate community question |
| `GET` | `/api/activity` | Real-time activity feed |
| `GET` | `/api/leads` | Lead intelligence with scores |
| `POST` | `/api/dashboard/chat` | Internal DevRel assistant |
| `POST` | `/api/agentmail/auto-reply` | Auto-reply all unanswered emails |
| `POST` | `/api/cron/daily-research` | Trigger live browser research |

---

## Tech Stack

**Backend:** Python · FastAPI · OpenAI · Supermemory · AgentMail · Browser Use · Vapi · MiniMax · Discord.py · Composio

**Frontend:** Next.js 16 · React 19 · Tailwind CSS 4 · Radix UI · shadcn/ui · Lucide · Recharts

**~6,550 lines of code** across 11 service integrations and 20+ API endpoints.

---

## License

MIT

---

*Built at YC Web Agents Hackathon · March 2026*
