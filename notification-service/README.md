# EHub Notification Service

The Notification Service handles email alerts and OTP (One-Time Password) management for secure user operations like password resets.

## Tech Stack
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Mail** (Gmail SMTP)
- **Thymeleaf** (Email Templating)
- **Redis** (OTP Storage & Expiration)
- **Docker & Docker Compose**

## Base URL
`http://localhost:8082`

---

## Configuration Requirements
To send emails, you must provide Gmail credentials as environment variables:
- `GMAIL_USERNAME`: Your Gmail address.
- `GMAIL_APP_PASSWORD`: A 16-digit Google App Password (not your account password).

---

## API Endpoints

### 1. Send Email Alert
Sends a generic HTML email alert using the `alert-template`.
- **URL:** `/notifications/send-alert`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "to": "recipient@example.com",
    "subject": "System Alert",
    "message": "Your account was accessed from a new device."
  }
  ```
- **Response:** `200 OK`

### 2. Request Password Reset OTP
Generates a 6-digit OTP, stores it in Redis (5 min expiry), and emails it to the user.
- **Rate Limit:** Max 5 OTPs per email address every 30 minutes.
- **URL:** `/notifications/password-reset/otp`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:** `200 OK`

### 3. Validate OTP
Checks if the provided OTP matches the one stored in Redis for the given email.
- **URL:** `/notifications/password-reset/validate`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:** `200 OK` (returns `true` or `false`)

---

## Email Templates
Located in `src/main/resources/templates`:
- `alert-template.html`: Professional layout for system alerts.
- `otp-template.html`: Security-focused layout for OTP delivery.

## Running with Docker
The service requires Redis to function. Use the root `docker-compose.yml`:
```bash
cd ..
docker-compose up --build
```
