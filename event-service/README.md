# Event Service

The core engine of EHub, managing missions, teams, and registrations.

## 📅 Mission Lifecycle
Events transition through automated states managed by a background scheduler:
1. `UPCOMING`
2. `REGISTRATION_OPEN`
3. `ONGOING` (Submissions Live)
4. `JUDGING` (Submissions Locked)
5. `COMPLETED`

## 🚀 API Reference
| Method | Endpoint |
| :--- | :--- |
| `GET` | `/events` |
| `POST` | `/events` |
| `POST` | `/events/{id}/register` |
| `POST` | `/events/teams/{eventId}` |
| `POST` | `/events/teams/{teamId}/submit` |

*For full request/response payloads, see the [Main API Documentation](../README.md#api-documentation).*
