# LinkSnap: Shorten URLs with Lightning Speed

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<!-- Tech Stack Badges -->
<p align="center">
  <!-- Frontend -->
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="shadcn/ui" src="https://img.shields.io/badge/shadcn--ui-000?style=for-the-badge&logo=react&logoColor=white" />
  <!-- Backend -->
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="Cassandra" src="https://img.shields.io/badge/Cassandra-1287B1?style=for-the-badge&logo=apachecassandra&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

A secure, full-featured, and modern URL shortener with password protection, expiry management, analytics, and a beautiful UI. Built for reliability, privacy, and a seamless user experience.

---

## 📚 Table of Contents
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Environment Variables](#-environment-variables)
- [Setup & Local Development](#-setup--local-development)
  - [Cassandra Setup](#cassandra-setup)
  - [Redis Setup](#redis-setup)
  - [Firebase Setup](#firebase-setup)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features
- Shorten URLs with one click
- Password-protect and set expiry for links
- Real-time analytics and QR code generation
- Secure authentication (Firebase Auth)
- RESTful API with robust validation (zod)
- Rate limiting, security headers, and XSS protection
- Responsive, accessible, and modern UI

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend:** Node.js, Express.js
- **Authentication:** Firebase Auth
- **Databases:** Cassandra (Astra DB), Redis(Cache database)
- **Deployment:** Vercel (frontend), Render (backend)

---

## 🔑 Environment Variables

### Frontend (`./.env.example`)

```bash
VITE_BACKEND_URL=<URL_of_your_backend_API (e.g., `http://localhost:4000` or your Render URL)>

VITE_FIREBASE_API_KEY=<your_firebase_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
VITE_FIREBASE_PROJECT_ID=<your_firebase_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_firebase_storage_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_firebase_messaging_sender_id?
VITE_FIREBASE_APP_ID=<your_firebase_app_id>
```

### Backend (`backend/.env.example`)

```bash
PORT=<port_to_run_the_backend(default: 4000)>
FRONTEND_URL=<deployed/local_frontend_url>

FIREBASE_SERVICE_ACCOUNT_KEY=<JSON_string_of_your_Firebase_service_account>

BASE62_CHARS=<random_set_of_chars_for_encoding_long_url>
MIN_BASE62_LENGTH=<minimum_length_of_base62_string (Eg: 5)>

CASSANDRA_DB_CLIENT_ID=<Astra_DB_client_ID>
CASSANDRA_DB_CLIENT_SECRET=<Astra_DB_client_secret>
CASSANDRA_DB_KEYSPACE=<Astra_DB_keyspace>
CASSANDRA_DB_SCB_PATH=<backend_local_path_of_scb_folder>

REDIS_URL=<Redis_connection_string (Eg:.`redis://localhost:6379` or Upstash/Render URL)>
REDIS_PORT=<upstash_redis_port>
REDIS_USERNAME=<upstash_redis_username>
REDIS_PASSWORD=<upstash_redis_password>
```
---

## 🏗️ Setup & Local Development

### 1. Clone & Install
```sh
git clone git@github.com:RoystonDAlmeida/LinkSnap.git
cd LinkSnap/

npm install
```

### 2. Environment Setup
- Copy `.env.example` to `.env` in both current project directory(for frontend) and `backend/`.
- Fill in all required variables as described above.

### 3. Cassandra Setup
- **Recommended:** Use [DataStax Astra DB](https://astra.datastax.com/) (free tier available).
- Download the secure connect bundle for your database and place it in `backend/` (or use a build-time download as described in backend docs).
- Set up your keyspace and tables:
  - `urls` and `urls_by_id` tables for storing short/long URLs and metadata.
- Update your `.env` with Astra DB credentials.

### 4. Redis Setup
- **Local:** Install Redis (`brew install redis` or `apt install redis-server`), then run `redis-server`.
- **Cloud:** Use [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/) for a free managed Redis instance.
- Update your backend `.env` with the Redis connection string.

### 5. Firebase Setup
- Go to [Firebase Console](https://console.firebase.google.com/), create a project.
- Enable **Authentication** (Email/Password, Google.).
- Download the service account JSON and set it as `FIREBASE_SERVICE_ACCOUNT_KEY` in your backend `.env` (as a JSON string).
- Add your Firebase config to the frontend `.env`.

### 6. Run Locally
- **Frontend(current directory):**
  ```sh
  npm run dev
  ```
- **Backend:**
  ```sh
  cd backend/
  npm run dev
  ```

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for details.