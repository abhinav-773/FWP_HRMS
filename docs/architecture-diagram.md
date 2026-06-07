# HRGPT Platform Architecture

HRGPT is designed as a scalable, modern Monorepo utilizing a decoupling strategy between the real-time node backend and a Vite-React SPA frontend.

## High-Level Architecture Diagram

```mermaid
graph TD
    Client[Web Browser / Client]
    
    subgraph Load_Balancer[Reverse Proxy / Nginx]
        LB(Nginx)
    end
    
    subgraph Frontend[Frontend Tier]
        Vite[Vite React SPA]
        Tailwind[TailwindCSS / Framer Motion]
    end
    
    subgraph Backend[Backend API Tier]
        Express[Node.js + Express]
        SocketIO[Socket.io Server]
        Prisma[Prisma ORM]
    end
    
    subgraph AI_Engine[AI Microservices / Engines]
        Llama[Llama 3 Local Inferencing]
        Whisper[OpenAI Whisper TTS/STT]
        VectorDB[(Vector Embeddings)]
    end
    
    subgraph Data_Tier[Database & Caching]
        Postgres[(PostgreSQL/MongoDB)]
        Redis[(Redis Cache & PubSub)]
    end

    Client -->|HTTPS / WSS| LB
    LB -->|Static Assets| Vite
    LB -->|API Requests| Express
    LB -->|WebSocket| SocketIO
    
    Express -->|CRUD / Queries| Prisma
    Express -->|LLM Prompts| Llama
    Express -->|Audio Processing| Whisper
    Express -->|Similarity Search| VectorDB
    
    Prisma --> Postgres
    Express -->|Rate Limiting / Sessions| Redis
    SocketIO -->|Cross-node Events| Redis
```

## Technology Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Routing:** React Router v6
- **Styling:** Tailwind CSS, Framer Motion for micro-animations
- **State Management:** React Context + Zustand (for Copilot)
- **Data Fetching:** Axios, React Query
- **Charts:** Recharts

### Backend
- **Framework:** Node.js, Express, TypeScript
- **Database:** MongoDB (via Prisma ORM / Mongoose fallback)
- **Real-Time:** Socket.io, Redis Pub/Sub
- **Auth:** JWT (Access + Refresh token rotation), bcryptjs
- **Security:** Helmet, rate-limiting, HPP

### AI & Infrastructure
- **Embeddings:** HuggingFace / OpenAI for Vector Embeddings.
- **Evaluation Engine:** Prompts structured for Llama 3 8B.
- **Docker:** Multi-stage Dockerfiles for production builds.
- **CI/CD:** GitHub Actions.
