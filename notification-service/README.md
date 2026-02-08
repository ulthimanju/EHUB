# Notification Service

A centralized gateway for all outgoing communications in EHub.

## ✉️ Responsibilities
- OTP Generation and Validation (reuses existing OTPs if requested again within TTL).
- Secure storage of codes in **Redis** with a strict **10-minute expiry**.
- HTML Template rendering for Emails (Alerts, Team Invites, Registration Status).

## 🚀 API Reference
| Method | Endpoint |
| :--- | :--- |
| `POST` | `/notifications/send-alert` |
| `POST` | `/notifications/password-reset/otp` |
| `POST` | `/notifications/password-reset/validate` |

*Note: This service is mostly used internally by other microservices via the `NotificationClient`.*