# EHub Auth Service UML Diagrams

This folder contains Mermaid-based UML diagrams for the Auth Service. You can view these directly in GitHub, VS Code (with Mermaid extensions), or by pasting the content into the [Mermaid Live Editor](https://mermaid.live/).

## Diagrams Included:

1. **[auth-flow.mermaid](./auth-flow.mermaid)**
   - Describes the Sequence Flow for User Registration and Login.
   - Shows interactions between the Controller, Service, Database, and JWT Utility.

2. **[class-diagram.mermaid](./class-diagram.mermaid)**
   - Describes the internal Class Structure of the microservice.
   - Shows the relationships between Controllers, Services, Repositories, and Entities.

3. **[password-reset-integration.mermaid](./password-reset-integration.mermaid)**
   - Describes the cross-service flow for secure password reset.
   - Shows how Auth Service coordinates with Notification Service to verify OTPs.

## Notification Service Diagrams:

1. **[notification-flow.mermaid](./notification-flow.mermaid)**
   - Describes the Sequence Flow for OTP generation and Email Alerts.
   - Shows interactions with Redis and Gmail SMTP.

2. **[notification-class-diagram.mermaid](./notification-class-diagram.mermaid)**
   - Describes the Class Structure of the notification service.

3. **[component-diagram.mermaid](./component-diagram.mermaid)**
   - High-level view of the EHub system components and their external dependencies (PostgreSQL, Redis, Gmail).

## Common Services Diagrams:

1. **[common-services]** (Included in Class and Component diagrams)
   - Describes the UUID generation flow and internal utility architecture.
   - Shows how Common Services provides unique IDs to the Auth Service.
