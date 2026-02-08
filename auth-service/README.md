# Auth Service

The Auth Service manages user security, registration, and role-based access control for EHub.

## 🔑 Core Features
- JWT-based authentication.
- Secure OTP flow for registration and password resets (10-min expiry).
- Role management (Participant -> Organizer).

## 🚀 API Reference
| Method | Endpoint |
| :--- | :--- |
| `POST` | `/auth/login` |
| `POST` | `/auth/register` |
| `POST` | `/auth/reset-password` |
| `POST` | `/auth/upgrade-role` |

*For full request/response payloads, see the [Main API Documentation](../README.md#api-documentation).*