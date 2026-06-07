# HRGPT Deployment Guide

This document covers deploying HRGPT to various cloud providers.

## Pre-requisites
1. A PostgreSQL instance (v15+)
2. A MongoDB instance (v6+)
3. A Redis instance (v7+)
4. API keys for any external services (e.g., OpenAI if used, JWT secrets)

---

## AWS (Amazon Web Services)
**Recommended Architecture**: EC2 with Docker Compose (Monolith) OR ECS Fargate + RDS + ElastiCache (Distributed).

### Option A: Monolithic EC2 (Easiest)
1. Provision an Ubuntu EC2 instance (t3.large or larger).
2. Install Docker and Docker Compose.
3. Clone the repository and configure `.env`.
4. Run `docker-compose -f docker-compose.prod.yml up -d`.
5. Point your domain (Route 53) to the EC2 Elastic IP and use AWS ACM + ALB or Let's Encrypt for SSL.

### Option B: Distributed (Enterprise)
- **Frontend**: Deploy static dist to S3 + CloudFront.
- **Backend**: Deploy Docker container to ECS Fargate.
- **Database**: Use Amazon RDS (PostgreSQL) and Amazon DocumentDB (MongoDB compatibility).
- **Cache**: Amazon ElastiCache (Redis).
- **AI Service**: EC2 instance with GPU (g4dn.xlarge) or SageMaker endpoints.

---

## Vercel (Frontend)
1. Import the repository into Vercel.
2. Select the `frontend` root directory.
3. Framework Preset: **Vite**.
4. Set Environment Variables (e.g., `VITE_API_URL`).
5. Deploy. (Vercel automatically sets up edge caching and SSL).

---

## Railway / Render (Backend + DBs)
Railway and Render are excellent for managed PaaS deployments.

1. **Databases**: Provision PostgreSQL and Redis services within Railway/Render.
2. **Backend**:
   - Create a new service from the GitHub repository.
   - Root directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Add environment variables, linking the provisioned DBs.
3. **MongoDB**: Use MongoDB Atlas (free tier or serverless) and provide the URI in the backend variables.

---

## Azure
1. **Frontend**: Azure Static Web Apps.
2. **Backend**: Azure App Service (Linux Web App for Containers) using the backend Docker image.
3. **Databases**: Azure Database for PostgreSQL & Azure Cosmos DB (for MongoDB).
4. **AI Service**: Azure ML Studio or a GPU-enabled Azure VM.
