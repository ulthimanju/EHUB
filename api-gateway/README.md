# API Gateway

The API Gateway serves as the entry point for the microservices architecture, routing requests to the appropriate backend services. It is built using **Spring Cloud Gateway**.

## Prerequisites
- Java 21
- Maven

## Configuration
- **Port**: 8080 (Default)
- **Application Name**: `api-gateway`

## Running the Service

### Local
```bash
mvn spring-boot:run
```

### Docker
```bash
docker build -t api-gateway .
docker run -p 8080:8080 api-gateway
```

## Routing
- `/users/**` -> `user-service`
- `/auth/**` -> `auth-service` (if applicable)

## Features
- **Routing**: Dynamic routing to microservices.
- **CORS**: Configured to allow cross-origin requests from frontend applications.
