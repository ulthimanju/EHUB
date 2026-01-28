# Event Hub (Microservices Architecture)

> A scalable, event-driven platform for managing hackathons and tech events. Built with **Spring Boot Microservices**, **PostgreSQL**, **Redis**, **RabbitMQ**, and secured with **Keycloak**.

## 🛠 Tech Stack

### Backend
*   **Framework:** Spring Boot 3.3 (Java 21)
*   **Gateway:** Spring Cloud Gateway (Routing, CORS, Security)
*   **Security:** Keycloak (OAuth2 / OpenID Connect)
*   **Databases:**
    *   **PostgreSQL:** Primary relational store (Users, Events).
    *   **Redis:** L2 Cache for high-performance Event Catalog reads.
*   **Messaging:** RabbitMQ (Asynchronous Event Bus).
*   **Build Tool:** Maven.

### Infrastructure
*   **Containerization:** Docker & Docker Compose.
*   **Resilience:** Resilience4j (Circuit Breakers).

---

## 🏗 Architecture

### System Context Diagram
```mermaid
graph TD
    User((User)) -->|HTTP/REST| Gateway[API Gateway]
    Gateway -->|Auth Check| Keycloak[Keycloak IAM]
    
    Gateway -->|/users| US[User Service]
    Gateway -->|/events| ES[Event Service]
    Gateway -->|/notifications| NS[Notification Service]
    
    US -->|Write| DB_User[(Postgres: UserDB)]
    ES -->|Write| DB_Event[(Postgres: EventDB)]
    ES -->|Read (Cache)| Redis[(Redis Cache)]
    
    US -->|Publish: UserRegistered| MQ[RabbitMQ]
    ES -->|Publish: EventCreated| MQ
    
    MQ -->|Consume| NS
    NS -->|Send Email| SMTP[SMTP Server]
```

---

## 🚀 Getting Started

### Prerequisites
*   **Java 21 SDK**
*   **Docker Desktop** (Required for DBs and Brokers)
*   **Maven 3.9+**

### 1. Start Infrastructure
Spin up the supporting services (Postgres, Redis, RabbitMQ, Keycloak).

```bash
docker-compose up -d
```

### 2. Build Microservices
Build the common library and all services.

```bash
mvn clean install -DskipTests
```

### 3. Run Services
You can run them in separate terminals or via Docker (if Dockerfiles are set up).

**API Gateway (Port 8080):**
```bash
cd api-gateway
mvn spring-boot:run
```

**User Service (Port 8081 - Internal):**
```bash
cd user-service
mvn spring-boot:run
```

**Event Service (Port 8082 - Internal):**
```bash
cd event-service
mvn spring-boot:run
```

**Notification Service (Port 8083 - Internal):**
```bash
cd notification-service
mvn spring-boot:run
```

---

## 🔑 Environment Variables & Configuration

The application uses `application.yml` defaults for local development. Key overrides can be set via environment variables.

| Variable | Description | Default | Service |
| :--- | :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | Postgres Connection URL | `jdbc:postgresql://localhost:5432/...` | User, Event |
| `SPRING_RABBITMQ_HOST` | RabbitMQ Host | `localhost` | All |
| `KEYCLOAK_URL` | Keycloak Auth Server | `http://localhost:9090` | Gateway, All |
| `REDIS_HOST` | Redis Cache Host | `localhost` | Event |

---

## 📡 API Endpoints (Gateway: http://localhost:8080)

### Public
*   `GET /events` - List all events (Cached via Redis).
*   `GET /events/{id}` - Get event details.
*   `POST /users/auth/register` - Create a new user account.

### Protected (Requires Bearer Token)
*   `POST /events` - Create a new event.
*   `PUT /events/{id}` - Update event (Owner only).
*   `GET /users/profile` - Get current user profile.

---

## ⚡ Performance Optimizations
1.  **Redis Caching:** The `/events` endpoint uses **Cache-Aside** with a 1-hour TTL.
2.  **Entity Graphs:** `EventRepository` uses `@EntityGraph` to fetch Venues in a single query, eliminating N+1 issues.
3.  **Circuit Breaker:** User Service protects against Notification Service failures using Resilience4j.
