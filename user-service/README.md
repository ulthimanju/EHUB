# User Service

The User Service is responsible for managing user profiles and accounts.

## Prerequisites
- Java 21
- Maven
- PostgreSQL (or H2 for local dev if configured)

## Configuration
- **Port**: 8081 (Default, checks `application.yml`)
- **Database**: PostgreSQL

## Running the Service

### Local
```bash
mvn spring-boot:run
```

## API Reference

### User Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/users` | Create a new user |
| `GET` | `/users/{id}` | Get user details by ID |
| `PATCH` | `/users/{id}` | Update user details |
| `GET` | `/users` | Get all users |

### Error Handling
This service uses the standard error response format from `common-library`:
```json
{
  "timestamp": "2024-01-23T10:00:00",
  "status": 404,
  "error": "Resource Not Found",
  "message": "User not found with id: 1",
  "path": "/users/1"
}
```
