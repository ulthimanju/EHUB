# EHub System UML Diagrams

This folder contains Mermaid-based UML diagrams for the EHub Hackathon Platform. These diagrams reflect the refactored system architecture, including microservices, client abstractions, and standardized enums.

## Core System Diagrams:

1. **[component-diagram.mermaid](./component-diagram.mermaid)**
   - High-level view of the microservices architecture.
   - Shows relationships between services (Auth, Event, Notification, AI, Submission) and external dependencies (Postgres, Redis, Gmail, OpenAI).

2. **[class-diagram.mermaid](./class-diagram.mermaid)**
   - Comprehensive class structure across main services.
   - Highlights the use of enums (`EventStatus`, `UserRole`, etc.) and client abstractions (`CommonClient`, `NotificationClient`).

3. **[er-diagram.mermaid](./er-diagram.mermaid)**
   - Entity-Relationship diagram for the entire system.
   - Covers Users, Events, Registrations, Teams, Members, and Evaluations.

## Service Flows:

1. **[auth-flow.mermaid](./auth-flow.mermaid)**
   - Sequence flow for User Registration, Login, and Role Upgrade.
   - Demonstrates interaction with `NotificationClient` and `CommonClient`.

2. **[password-reset-integration.mermaid](./password-reset-integration.mermaid)**
   - Cross-service flow for secure password reset using OTPs.

3. **[notification-flow.mermaid](./notification-flow.mermaid)**
   - Sequence flow for OTP generation and template-based alerts.
   - Reflects the 10-minute security expiry for OTPs.

## Service-Specific Diagrams:

1. **[notification-class-diagram.mermaid](./notification-class-diagram.mermaid)**
   - Detailed class structure of the Notification Service, including the `NotificationTemplate` enum.

---

### How to View
You can view these diagrams directly in:
- **GitHub**: Automatically renders `.mermaid` files.
- **VS Code**: Install the "Mermaid Editor" or "Markdown Preview Mermaid Support" extension.
- **Mermaid Live Editor**: Copy and paste the content into [mermaid.live](https://mermaid.live/).