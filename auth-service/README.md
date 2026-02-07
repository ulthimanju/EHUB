# EHub Auth Service

The Auth Service is a Spring Boot microservice responsible for user registration, authentication, and token management using JWT (JSON Web Tokens).

## Tech Stack
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (Stateless JWT)
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Docker & Docker Compose**

## Base URL
`http://localhost:8081`

---

## API Endpoints

### 1. Request Registration OTP
Sends an OTP to the user's email to verify it before registration.
- **URL:** `/auth/register/otp`
- **Method:** `POST`
- **Params:** `email=john@example.com`
- **Response:** `200 OK`

### 2. Register User
Creates a new user account. **Requires a valid OTP.**
- **URL:** `/auth/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "otp": "123456"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 2. Login
Authenticates a user and returns a JWT. Supports both username and email.
- **URL:** `/auth/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "securePassword123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
  ```

### 3. Validate Token
Checks if a provided JWT is valid and not expired.
- **URL:** `/auth/validate-token`
- **Method:** `GET`
- **Query Params:** `token={JWT_TOKEN}`
- **Response:** `200 OK`
  ```json
  true
  ```

### 4. Reset Password
Updates the password for a given email address. **Requires a valid OTP from the Notification Service.**
- **URL:** `/auth/reset-password`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "newPassword": "newSecurePassword456",
    "otp": "123456"
  }
  ```
- **Response:** `200 OK`
  ```text
  Password reset successfully
  ```

### 5. Logout
Standard logout endpoint (Stateless).
- **URL:** `/auth/logout`
- **Method:** `POST`
- **Response:** `200 OK`
  ```text
  Logged out successfully
  ```

---

## Security
- **Passwords:** Hashed using BCrypt.
- **JWT:** Tokens are signed using HMAC-SHA256.
- **Authorization:** Public endpoints: `/auth/register`, `/auth/login`. All others require `Authorization: Bearer {token}`.

## Running with Docker
From the project root:
```bash
docker-compose up --build
```
