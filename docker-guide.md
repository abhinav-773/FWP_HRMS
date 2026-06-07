# Docker Production Guide

This guide explains how to manage the HRGPT Dockerized environment.

## Building the Images
To build the complete stack locally using the production configuration:

```bash
docker compose -f docker-compose.prod.yml build
```

## Running the Stack
To start the entire infrastructure (Databases, Redis, Nginx, Node Backend, Python AI, React Frontend):

```bash
docker compose -f docker-compose.prod.yml up -d
```
The `-d` flag runs the containers in detached mode.

## Stopping the Stack
To stop the containers without destroying the data volumes:
```bash
docker compose -f docker-compose.prod.yml stop
```

To tear down the containers entirely (data volumes will persist unless `-v` is used):
```bash
docker compose -f docker-compose.prod.yml down
```

## Viewing Logs
To view logs for a specific service, for example, the backend:
```bash
docker logs hrgpt-backend -f
```

## Database Migrations in Docker
When you update the Prisma schema, you need to apply migrations to the production database:
```bash
docker exec -it hrgpt-backend npx prisma migrate deploy
```

## Creating a Database Backup
To create a backup of the PostgreSQL database running in Docker:
```bash
docker exec -t hrgpt-postgres pg_dump -U admin -d hrgpt_db -F c > backup.dump
```
To restore it:
```bash
docker exec -i hrgpt-postgres pg_restore -U admin -d hrgpt_db < backup.dump
```
