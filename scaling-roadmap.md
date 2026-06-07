# HRGPT Scaling Roadmap

As HRGPT transitions from hundreds to millions of users, the infrastructure must evolve. This roadmap outlines the architectural changes required at various milestones.

## Phase 1: High Availability (0 - 10,000 Users)
**Current Stage**
- **Infrastructure**: Single EC2 instance / Basic Managed PaaS.
- **Database**: Single PostgreSQL Instance + Single MongoDB Instance.
- **Cache**: Single Redis node.
- **Bottlenecks**: Single point of failure if the EC2 instance goes down. LLM generation may queue up and timeout.

**Next Steps**:
1. Implement a Load Balancer (AWS ALB).
2. Spin up multiple Backend nodes across 2 Availability Zones.
3. Use a managed database service (Amazon RDS Multi-AZ) for automatic failover.

## Phase 2: AI Scaling (10,000 - 50,000 Users)
**Challenge**: LLM Generation (Interview simulations, parsing) becomes too slow as concurrency increases.
- **Solution A**: Migrate the AI Service to Kubernetes (EKS) and configure HPA (Horizontal Pod Autoscaling) based on GPU utilization metrics.
- **Solution B**: Offload LLM processing to asynchronous background jobs.
  - Implement **Celery/RabbitMQ** or **BullMQ** in Node.
  - When a user uploads a resume, queue a job. The frontend polls or listens via WebSockets for completion.

## Phase 3: Global CDN & Edge Computing (50,000 - 100,000 Users)
**Challenge**: Users in Europe experience high latency because servers are in US-East.
- **Solution**: 
  - Host the Frontend on Vercel Edge network.
  - Implement Redis Global Datastore or DynamoDB Global Tables to replicate session/chat state globally.
  - Implement PostgreSQL Read Replicas in different geographic regions.

## Phase 4: Database Sharding & Microservices (100,000+ Users)
**Challenge**: PostgreSQL connection limits reached, monolithic backend becomes hard to maintain.
- **Solution**:
  - Implement **PgBouncer** for connection pooling.
  - Shard the PostgreSQL database by `tenant_id` (Company ID) so each enterprise customer's data lives on a specific database shard.
  - Split the Monolithic Backend into domain-specific microservices (e.g., `AuthService`, `PayrollService`, `ATSService`).
  - Introduce an API Gateway (Kong / API6) to route traffic between microservices.
