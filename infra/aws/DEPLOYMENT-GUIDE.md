# TypeMaster Production Deployment Guide
## Frontend on Vercel & Backend on AWS

This guide provides end-to-end instructions for deploying TypeMaster in a production environment:
- **Frontend**: Next.js 15 App Router hosted on **Vercel** (Global Edge CDN, auto-scaling, automated CI/CD).
- **Backend**: Spring Boot 3.3.5 (Java 21, STOMP WebSockets) containerized and deployed on **AWS** (**AWS App Runner** or **AWS ECS Fargate**).
- **Database**: Managed **AWS RDS PostgreSQL 16** with Flyway automated migrations.
- **Cache / Coordinator**: **AWS ElastiCache Redis 7** (or standalone Redis container).

---

## Architecture Diagram

```
                       +-----------------------------------+
                       |         User Browser / Client      |
                       +-----------------+-----------------+
                                         |
                HTTPS / Assets           |           HTTPS (REST) & WSS (STOMP)
                     v                   |                        v
        +----------------------------+   |         +-----------------------------+
        |       Vercel Edge CDN      |   |         |           AWS Cloud         |
        |  (typemaster.com)          |   |         |   (api.typemaster.com)      |
        |                            |   |         |                             |
        |  Next.js 15 App Router     |   |         |   +-----------------------+ |
        |  - Unicode Khmer Segmenter |   |         |   | AWS App Runner / ALB  | |
        |  - Typing Practice Engine  |   |         |   +-----------+-----------+ |
        |  - Sound Synthesizer       |   |                     |                 |
        +----------------------------+   |         +-----------v-----------+     |
                                         |         | Spring Boot Container |     |
                                         |         | - REST API (Port 8081)|     |
                                         |         | - STOMP WebSockets    |     |
                                         |         | - Actuator /health    |     |
                                         |         +-----+-----------+-----+     |
                                         |               |           |           |
                                         |       SQL (5432)        Redis (6379)  |
                                         |               |           |           |
                                         |         +-----v-----+ +---v-----+     |
                                         |         |  AWS RDS  | | Elasti- |     |
                                         |         | Postgres  | | Cache   |     |
                                         |         +-----------+ +---------+     |
                                         +---------------------------------------+
```

---

## Phase 1: Provision AWS RDS PostgreSQL Database

1. Sign in to the **AWS Management Console** and navigate to **Amazon RDS**.
2. Click **Create database**:
   - **Engine type**: PostgreSQL (Version 16.x).
   - **Template**: Free tier (or Production / Dev/Test depending on scale).
   - **DB instance identifier**: `typemaster-db-prod`.
   - **Master username**: `typemaster_admin`.
   - **Master password**: Generate a secure 32-character password.
   - **Instance configuration**: `db.t4g.micro` (Free tier eligible) or `db.t4g.small`.
   - **Storage**: 20 GiB gp3 (enable storage autoscaling).
   - **Connectivity**:
     - **VPC**: Default VPC (or your custom application VPC).
     - **Public access**: No (keep private for security).
     - **VPC security group**: Create new `typemaster-rds-sg` allowing inbound port `5432` from the backend security group.
   - **Initial database name**: `typemaster`.
3. Note the **RDS Endpoint** once created (e.g., `typemaster-db-prod.c123456789.ap-southeast-1.rds.amazonaws.com`).

---

## Phase 2: Deploy Backend Container to AWS

### Option A: AWS App Runner (Recommended — Fastest, Zero Ops, Built-in HTTPS & WebSockets)

AWS App Runner provides fully managed container execution with automatic TLS certificates, auto-scaling, and native WebSocket support.

#### 1. Push Container Image to Amazon ECR
```bash
# Set your AWS variables
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO="typemaster-api"

# Create ECR repository
aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push the production Docker image
docker build -t typemaster-api:latest -f apps/api/Dockerfile apps/api
docker tag typemaster-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
```

#### 2. Create the AWS App Runner Service
1. In the AWS Console, open **AWS App Runner** -> **Create service**.
2. **Source**: Container registry -> **Amazon ECR** -> Select `typemaster-api:latest`.
3. **Deployment trigger**: Automatic (deploys every time a new image is pushed) or Manual.
4. **Service settings**:
   - **Service name**: `typemaster-api`.
   - **CPU / Memory**: 1 vCPU, 2 GB RAM.
   - **Port**: `8081`.
5. **Environment variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
   | `PORT` | `8081` | App port |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<RDS_ENDPOINT>:5432/typemaster` | RDS JDBC connection |
   | `SPRING_DATASOURCE_USERNAME` | `typemaster_admin` | RDS username |
   | `SPRING_DATASOURCE_PASSWORD` | `<SECURE_PASSWORD>` | RDS password |
   | `JWT_SECRET` | `<64_HEX_OR_BASE64_STRING>` | Token signing secret |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,https://typemaster.com` | Allowed frontend origins |
6. **Health check**:
   - **Protocol**: HTTP
   - **Path**: `/actuator/health`
   - **Interval**: 20s, **Timeout**: 5s, **Healthy threshold**: 1, **Unhealthy threshold**: 5
7. **Security & VPC**: Attach a VPC connector so App Runner can reach your private RDS instance.
8. Click **Create & Deploy**.
9. Once active, copy the **Default domain** (e.g., `https://abcxyz123.ap-southeast-1.awsapprunner.com`).

---

### Option B: AWS ECS Fargate + Application Load Balancer (ALB)

If your architecture requires custom ALB rules, AWS WAF, or VPC peering:
1. Register task definition using [infra/aws/ecs-task-definition.json](file:///d:/Personal%20Project/TypeMaster_Project_Documentation/infra/aws/ecs-task-definition.json).
2. Create an **Application Load Balancer (ALB)** with HTTPS listener (ACM Certificate).
3. Create a **Target Group**:
   - Target type: IP (Fargate).
   - Protocol: HTTP, Port: `8081`.
   - Health check path: `/actuator/health`.
   - **Stickiness**: Enable application or duration-based stickiness if running multiple replicas for STOMP sessions (or use Redis simple broker).
   - **Attributes**: Set `deregistration_delay.timeout_seconds` to 30, and `idle_timeout.timeout_seconds` to `3600` for WebSockets.
4. Create ECS Service with Fargate launch type on your cluster.

---

## Phase 3: Deploy Frontend to Vercel

1. Push your repository to **GitHub** (or GitLab/Bitbucket).
2. Go to [https://vercel.com](https://vercel.com) and log in.
3. Click **Add New...** -> **Project** -> Import your TypeMaster repository.
4. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`.
   - **Root Directory**: Click "Edit" and select `apps/web`.
   - **Build Command**: `next build` (or leave default).
   - **Output Directory**: `.next` (leave default).
   - **Install Command**: `npm install`.
5. **Environment Variables**:
   Add the following environment variables:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api/v1` (or your App Runner URL `https://<id>.<region>.awsapprunner.com/api/v1`) | REST API endpoint |
   | `NEXT_PUBLIC_WS_URL` | `wss://api.yourdomain.com/ws` (or your App Runner URL `wss://<id>.<region>.awsapprunner.com/ws`) | Secure WebSocket STOMP endpoint |
6. Click **Deploy**.
7. Vercel will build and assign preview URLs (e.g. `https://typemaster-web-xxx.vercel.app`) and your production URL.

---

## Phase 4: Custom Domain & DNS Mapping

To give your users a polished experience using your custom domain (e.g. `typemaster.com`):

### 1. Root & Web Domain (`typemaster.com` & `www.typemaster.com`) -> Vercel
- In Vercel Project Settings -> **Domains**: Add `typemaster.com` and `www.typemaster.com`.
- In Route 53 (or Cloudflare / Namecheap):
  - `A` Record: `@` -> `76.76.21.21` (Vercel IP).
  - `CNAME` Record: `www` -> `cname.vercel-dns.com`.

### 2. API & WebSocket Domain (`api.typemaster.com`) -> AWS
- In AWS App Runner -> **Custom domains**:
  - Add domain `api.typemaster.com`.
  - Add the validation `CNAME` records provided by AWS into Route 53.
  - Add the routing `CNAME` record pointing `api.typemaster.com` to the App Runner service.
- If using ECS with ALB:
  - Create a Route 53 Alias record pointing `api.typemaster.com` to the Application Load Balancer.
  - Attach an AWS ACM SSL certificate covering `*.typemaster.com` and `typemaster.com` to the ALB HTTPS 443 listener.

### 3. Update Backend CORS
Ensure the AWS environment variable `CORS_ALLOWED_ORIGINS` includes both your Vercel domains and your custom domains:
```
CORS_ALLOWED_ORIGINS=https://typemaster.com,https://www.typemaster.com,https://*.vercel.app
```

---

## Phase 5: Verification & Production Checklist

Perform these tests after deploying:

- [ ] **Health Check**: Open `https://api.typemaster.com/actuator/health` — should return `{"status":"UP"}`.
- [ ] **Khmer Font & Unicode Test**: Open `https://typemaster.com/practice`, switch to Khmer mode (`km`), and verify correct rendering of complex ligatures (e.g. `កម្ពុជា`) and IME typing.
- [ ] **Guest Typing Test**: Complete a test without signing in. Confirm session completion is saved and statistics calculate accurately.
- [ ] **User Registration / Auth**: Register an account, log out, log back in. Inspect DevTools cookies/headers to ensure JWT tokens work across cross-site domains (with `credentials: include`).
- [ ] **WebSocket Multiplayer**: Open two browser windows at `https://typemaster.com/multiplayer`. Create a room in window 1, join from window 2. Confirm:
  - STOMP connection establishes via `wss://api.typemaster.com/ws`.
  - Countdown synchronizes.
  - Real-time car progress updates smoothly.
  - Final placement matches server-authoritative results.
- [ ] **Privacy Compliance**: Inspect local storage and network payloads to confirm raw typed keystrokes are never transmitted or stored.

---

## Phase 6: Automated CI/CD (GitHub Actions)

A pre-configured GitHub Actions workflow is located at [ci-cd.yml](file:///d:/Personal%20Project/TypeMaster_Project_Documentation/.github/workflows/ci-cd.yml).

To enable automated deployment:
1. In your GitHub repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following repository secrets:
   - `AWS_ACCESS_KEY_ID`: IAM user access key with ECR and App Runner permissions.
   - `AWS_SECRET_ACCESS_KEY`: IAM user secret key.
   - `AWS_REGION`: Target AWS region (e.g. `ap-southeast-1` or `us-east-1`).
3. Vercel automatically deploys every push to `main` and creates preview URLs for pull requests when the Vercel GitHub App is installed.
