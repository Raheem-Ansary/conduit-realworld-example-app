# ![RealWorld Example App](logo.png)

> **React / Vite + SWC / Express.js / Sequelize / PostgreSQL codebase with production-style DevOps (Docker, docker-compose, CI, Kubernetes).**

This repository is a fork of [TonyMckes/conduit-realworld-example-app](https://github.com/TonyMckes/conduit-realworld-example-app) and implements the [RealWorld](https://realworld.io/) spec and API.

The fork focuses on showcasing a modern DevOps setup around the existing fullstack application:

- Backend: **Node.js / Express.js / Sequelize / PostgreSQL**
- Frontend: **React / Vite + SWC**
- DevOps: **Docker & multi-stage images, docker-compose, GitHub Actions CI, Kubernetes manifests**

Core business logic and application features are preserved; only infrastructure, configuration, and documentation have been adapted.

---

## Contents

- [Local development (Node.js only)](#local-development-nodejs-only)
- [Local development with Docker & docker-compose](#local-development-with-docker--docker-compose)
- [Environment configuration](#environment-configuration)
- [Running tests](#running-tests)
- [CI pipeline (GitHub Actions)](#ci-pipeline-github-actions)
- [Kubernetes manifests](#kubernetes-manifests)
- [License and acknowledgments](#license-and-acknowledgments)

---

## Local development (Node.js only)

### Prerequisites

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/) `v18.11.0+`
- [npm](https://www.npmjs.com/) (usually included with Node.js)
- A running PostgreSQL instance (for example via Docker Desktop or a local install)

### Installation

```bash
git clone https://github.com/<your-username>/conduit-realworld-example-app.git
cd conduit-realworld-example-app
npm install
```

### Configure the backend

1. Copy the backend example environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Adjust `backend/.env` to match your local PostgreSQL credentials. The default assumes:

   - database: `conduit_development`
   - username: `conduit`
   - password: `conduit`
   - host: `127.0.0.1`
   - dialect: `postgres`

3. Create and optionally seed the database:

   ```bash
   npm run sqlz -- db:create
   npm run sqlz -- db:seed:all   # optional
   ```

### Configure the frontend

1. Copy the example environment file:

   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Ensure `VITE_API_BASE_URL` points to your backend (for example: `http://localhost:3001`). If left empty, the frontend will use same-origin relative `/api` requests.

### Run the app (Node dev servers)

Start both backend and frontend together:

```bash
npm run dev
```

Or individually:

```bash
npm run dev:backend   # backend on http://localhost:3001
npm run dev:frontend  # frontend on http://localhost:3000
```

Open:

- Frontend: <http://localhost:3000/>
- API: <http://localhost:3001/api>

---

## Local development with Docker & docker-compose

This project ships a full docker-compose setup for a production-like local environment.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/) (often included with Docker Desktop)

### Configure environment (optional)

An example root-level environment file is provided at `.env.example`:

```bash
cp .env.example .env
```

You can customize:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `BACKEND_PORT`, `BACKEND_NODE_ENV`
- `JWT_SECRET`
- `VITE_API_BASE_URL` (for frontend builds, optional)

### Build and run with docker-compose

From the repository root:

```bash
docker-compose up --build
```

Services:

- `db`: PostgreSQL with a persistent volume (`db-data`)
- `backend`: Express/Sequelize API running on port `3001`
- `frontend`: React/Vite build served by nginx on port `3000`

Healthchecks:

- PostgreSQL uses `pg_isready`
- Backend exposes a simple HTTP healthcheck on `/api/tags`

Once all containers are healthy:

- Frontend: <http://localhost:3000/>
- API (from host): <http://localhost:3001/api>

By default (with an empty `VITE_API_BASE_URL`), the frontend uses same-origin `/api` requests, which are proxied by nginx to the backend service inside the Docker network.

Stop everything with:

```bash
docker-compose down
```

The database volume (`db-data`) keeps your data between runs.

---

## Environment configuration

### Backend

The backend uses standard Sequelize-style configuration via `backend/config/config.js`.

Key environment variables (examples for production / Docker):

- `PORT` – API port (default: `3001`)
- `JWT_KEY` – JWT signing key
- `PROD_DB_USERNAME` / `PROD_DB_PASSWORD`
- `PROD_DB_NAME`
- `PROD_DB_HOSTNAME`
- `PROD_DB_DIALECT` (e.g. `postgres`)
- `PROD_DB_LOGGING` (`true` / `false`)

Additional generic variables supported in production:

- `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_DIALECT`, `DB_LOGGING`

For local Node development, use `backend/.env` based on `backend/.env.example`.

### Frontend

The frontend is a Vite application and uses standard `VITE_`-prefixed variables:

- `VITE_API_BASE_URL` – base URL for backend API requests

This value is read at build time. For local development and docker-compose the defaults map to:

- Node dev: `http://localhost:3001`
- Docker Compose: `http://backend:3001` (internal Docker service name)

Example file: `frontend/.env.example`.

---

## Running tests

Tests are powered by [Vitest](https://vitest.dev/) and cover both frontend and backend helpers.

From the repository root:

```bash
npm test
```

Or separately:

```bash
npm run test:backend   # backend-focused tests
npm run test:frontend  # frontend-focused tests
```

---

## CI pipeline (GitHub Actions)

A single CI workflow is defined in `.github/workflows/ci.yml`. It runs on pushes and pull requests.

The pipeline:

1. Checks out the repository
2. Sets up Node.js 18 LTS
3. Installs dependencies with `npm ci`
4. Runs tests across backend and frontend:

   ```bash
   npm test
   ```

5. Builds the frontend:

   ```bash
   npm run build:frontend
   ```

6. Builds Docker images for backend and frontend to validate Dockerfiles:

   ```bash
   docker build -t conduit-backend:ci -f backend/Dockerfile .
   docker build -t conduit-frontend:ci -f frontend/Dockerfile .
   ```

7. Optionally pushes images to Docker Hub if the following secrets are configured:

   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

When present, images are pushed with `latest` and a short commit SHA tag:

- `<DOCKERHUB_USERNAME>/conduit-backend:latest` and `:<short-sha>`
- `<DOCKERHUB_USERNAME>/conduit-frontend:latest` and `:<short-sha>`

---

## Kubernetes manifests

A minimal Kubernetes setup is provided under the `k8s/` directory. It is intended as a starting point for deploying the app to:

- local clusters (kind, minikube, k3d)
- managed Kubernetes offerings (EKS, AKS, GKE, etc.)

Resources:

- Namespace: `k8s/namespace.yaml` (`conduit`)
- ConfigMap: `k8s/configmap.yaml` (`conduit-config`) for non-secret config:
  - Backend port and environment
  - Database host/name/dialect/logging
  - A suggested API base URL
- Secret: `k8s/secret.yaml` (`conduit-secrets`) for:
  - `DB_USERNAME`, `DB_PASSWORD`
  - `JWT_KEY`
- Backend:
  - Deployment: `k8s/backend-deployment.yaml`
  - Service: `k8s/backend-service.yaml`
- Frontend:
  - Deployment: `k8s/frontend-deployment.yaml`
  - Service: `k8s/frontend-service.yaml`
- Ingress (optional): `k8s/ingress.yaml`

The backend Deployment expects a Docker image such as:

- `your-dockerhub-username/conduit-backend:latest`

The frontend Deployment expects:

- `your-dockerhub-username/conduit-frontend:latest`

Update the `image:` fields to match your registry and tags.

Example apply sequence:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml   # optional
```

The example Ingress routes:

- `http://conduit.local/` → frontend Service
- `http://conduit.local/api` → backend Service

Configure DNS or `/etc/hosts` to map `conduit.local` to your Ingress controller.

---

## License and acknowledgments

This project is licensed under the MIT License. See the `LICENSE` file for details.

This fork is used as a **DevOps showcase**. Application logic and API design are based on the original RealWorld example app:

- [RealWorld](https://realworld.io/)
- [RealWorld (GitHub)](https://github.com/gothinkster/realworld)
- Original codebase: [TonyMckes/conduit-realworld-example-app](https://github.com/TonyMckes/conduit-realworld-example-app)
