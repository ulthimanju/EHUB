---
name: documentation-maintenance
description: Defines the rules and standards for maintaining README.md files and other documentation within the project. Use this skill to ensure documentation stays synchronized with code changes.
---

# Documentation Maintenance Rules

## When to Update Documentation
- **Service Configuration**: Update `README.md` when ports, environment variables, or configuration keys change.
- **API Endpoints**: Update `README.md` when new endpoints are added, or existing endpoints (paths, parameters, bodies) are modified.
- **Dependencies**: Update `README.md` if new major dependencies/services are added that require specific setup (e.g., a new database).
- **Build/Run Instructions**: Update `README.md` if the build or run commands change.

## Standard README Structure
Every service `README.md` must contain the following sections:

### 1. Title & Description
- Service name.
- Brief explanation of the service's responsibility.

### 2. Prerequisites
- Java version (e.g., Java 21).
- Build tools (e.g., Maven).
- External services (e.g., PostgreSQL, RabbitMQ).

### 3. Configuration
- Default port.
- Key environment variables.

### 4. Running the Service
- Command to run locally (e.g., `mvn spring-boot:run`).
- Command to run with Docker (if applicable).

### 5. API Reference (for Services)
- List of main endpoints with methods and brief descriptions.
- Link to Swagger UI if available.
