# CortexAI

CortexAI is a full-stack AI chat application with a React frontend and a
Node.js backend split into gateway, authentication, chat, agent, and billing
services.

## Architecture

```text
Browser (Vite, port 5173)
        |
        v
Gateway (port 8000)
  |       |       |       |
 Auth    Chat    Agent   Billing
 8001    8002    8003     8004
        |
 Redis (port 6379)     MongoDB Atlas
```

The backend uses MongoDB for application data, Redis for sessions, Firebase
Authentication for Google sign-in, and Razorpay for billing. The agent service
can also use the configured model, search, vector database, and object storage
providers.

## Requirements

- Node.js 22 or newer
- npm
- Docker Desktop with Docker Compose
- MongoDB Atlas database and a database user
- Firebase project configured for Google sign-in

Additional provider credentials are needed for the agent and billing features
you enable.

## Local development

Clone the repository and open PowerShell in the project folder:

```powershell
git clone https://github.com/Ansh01612/cortex-ai-.git
cd cortex-ai-
```

Create a `.env` file in each location listed under [Environment configuration](#environment-configuration),
and add the Firebase Admin service-account JSON described below. Do not commit
`.env` files or service-account credentials.

Install dependencies from each package directory:

```powershell
cd backend
npm install
cd gateway
npm install
cd ..\services\auth
npm install
cd ..\chat
npm install
cd ..\agent
npm install
cd ..\billing
npm install
cd ..\..\..\frontend
npm install
```

Start the full local stack with one command from the project root:

```powershell
.\start-dev.ps1
```

The script starts Redis and any backend/frontend services that are not already
running, opens the frontend at <http://localhost:5173>, and leaves service
output visible in separate PowerShell windows. Keep those windows open. If
PowerShell blocks local scripts, run it once using:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

Stop Redis when finished with:

```powershell
cd "path\to\cortex-ai-\backend"
docker compose down
```

## Environment configuration

Create local `.env` files using the variable names below. Use real values from
your own provider accounts; never copy credentials into source code or commit
them to Git.

| File | Variables |
| --- | --- |
| `frontend/.env` | `VITE_FIREBASE_API_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_SERVER_URL` |
| `backend/gateway/.env` | `PORT`, `AUTH_SERVICE`, `CHAT_SERVICE`, `AGENT_SERVICE`, `BILLING_SERVICE`, `FRONTEND_URL`, `REDIS_URL` |
| `backend/services/auth/.env` | `PORT`, `MONGODB_URI`, `REDIS_URL` |
| `backend/services/chat/.env` | `PORT`, `MONGODB_URI` |
| `backend/services/agent/.env` | `PORT`, `MONGODB_URI`, `GROQ_API_KEY`, `GOOGLE_API_KEY`, `CHAT_SERVICE`, `AUTH_SERVICE`, `REDIS_URL`, `TAVILY_API_KEY`, `OPENROUTER_API_KEY`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_KEY`, `AWS_BUCKET_NAME`, `QDRANT_API_KEY`, `QDRANT_URL` |
| `backend/services/billing/.env` | `PORT`, `MONGODB_URI`, `AUTH_SERVICE`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |

For local development, the backend service URLs normally use ports `8000`
(gateway), `8001` (auth), `8002` (chat), `8003` (agent), and `8004` (billing).
Set `FRONTEND_URL` to `http://localhost:5173`, and `VITE_SERVER_URL` to
`http://localhost:8000`. The Redis Compose file binds Redis to localhost on
port `6379`.

The auth service also needs a Firebase Admin service-account JSON file at
`backend/services/auth/serviceAccountKey.json`. This file is excluded from
Git; obtain it from your Firebase project and keep it private. Set the
MongoDB URI to a MongoDB Atlas connection string with a database user, and
allow your development IP in the Atlas network-access settings.

Agent provider variables are required only for the corresponding integrations.
Keep all provider secrets server-side; only frontend values prefixed with
`VITE_` are exposed to the browser.

## Production deployment

The repository includes a GitHub Actions workflow at
`.github/workflows/deploy.yml` for deploying backend images to AWS ECR/ECS and
the frontend to S3/CloudFront. Configure the AWS credentials, resource names,
and other required values as GitHub Actions repository secrets before enabling
that workflow. Configure each service's runtime environment in the deployment
platform as well.

## Security

- `.env` files, Firebase service-account keys, dependencies, and build output
  are excluded from Git.
- Rotate any credential that has been shared or accidentally exposed.
- Do not expose Redis directly to the public internet.
- Restrict Firebase browser API keys to the intended domains in Firebase
  settings.
