# EHub Setup Guide

Follow these instructions to set up and run the EHub Unified Hackathon Platform on your system.

## 📋 Prerequisites

Ensure you have the following installed:
- **Docker & Docker Compose** (Recommended for easiest setup)
- **Java 17 JDK** (For local development)
- **Node.js 18+** (For local frontend development)
- **Maven 3.8+** (For building JARs)
- **Git**

---

## 🛠️ Step 1: Environment Configuration

The system requires several environment variables for security, email notifications, and AI evaluation.

1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```

2. Add the following variables to `.env` (Replace with your actual credentials):
   ```env
   # Gmail Credentials (required for notification-service)
   # You must use a Gmail App Password, not your account password
   GMAIL_USERNAME=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

   # Gemini AI Key (required for ai-service)
   # Obtain from: https://aistudio.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key

   # OTP Rate Limiting
   APP_ITEM_LIMIT=5
   APP_TIME_LIMIT=30

   # Security
   APPLICATION_SECURITY_JWT_SECRET_KEY=your_random_64_char_hex_string
   ```

---

## 🐳 Step 2: Running with Docker (Recommended)

EHub is fully containerized. You can start all 10+ services with a single command.

1. **Build and Start Services**:
   ```bash
   docker compose up -d --build
   ```

2. **Verify Containers**:
   Wait a few minutes for the databases to initialize. Check the status:
   ```bash
   docker compose ps
   ```
   Ensure `ehub-auth-db` and `ehub-event-db` show as `healthy`.

3. **Access the Application**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Gateway**: [http://localhost:8000](http://localhost:8000)

---

## 🏗️ Step 3: Local Development (Non-Docker)

If you wish to run a specific service locally for debugging:

### Backend Services (Spring Boot)
1. Navigate to the service folder (e.g., `event-service`).
2. Build the JAR:
   ```bash
   mvn clean install -DskipTests
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *Note: Ensure you have local instances of PostgreSQL (Ports 5433/5434) and Redis (6379) running.*

### Web Client (React)
1. Navigate to `web-client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🔍 Troubleshooting

- **Database Connection Refused**: Ensure you are using the correct ports. In Docker, services use internal hostnames (e.g., `auth-db`). Locally, you must use the mapped ports defined in `docker-compose.yml` (`5433` for Auth, `5434` for Event).
- **Email Not Sending**: Verify your `GMAIL_APP_PASSWORD`. Standard passwords will be rejected by Google SMTP.
- **AI Evaluation Fails**: Ensure your `GEMINI_API_KEY` is valid and has not reached its rate limit.
- **Port Conflicts**: Ensure ports `8000`, `3000`, `8081`, `8082`, `6379`, `5433`, and `5434` are not being used by other applications.

---

## 📈 System Health
You can monitor logs for any service using:
```bash
docker compose logs -f [service-name]
```
Example: `docker compose logs -f ai-service`
