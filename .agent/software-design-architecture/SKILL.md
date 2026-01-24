---
name: software-design-architecture
description: Provides guidelines for following software design principles and architecture patterns in Spring Boot microservices. Use this when the developer needs guidance on SOLID principles, clean architecture, and architectural best practices.
---

# Software Design and Architecture Best Practices

## Apply SOLID Principles

### Single Responsibility Principle
Each class should have one reason to change. Separate validation, business logic, data access, and presentation concerns.

### Dependency Inversion Principle
Depend on abstractions (interfaces), not concrete implementations. Use constructor injection for dependencies.
```java
@Service
public class OrderService {
    private final OrderRepository repository;
    private final PaymentGateway paymentGateway;
    
    public OrderService(OrderRepository repository, PaymentGateway paymentGateway) {
        this.repository = repository;
        this.paymentGateway = paymentGateway;
    }
}
```

## Follow Layered Architecture

Organize code in layers: Controller → Service → Repository → Entity
- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic and orchestration
- **Repositories**: Handle data access operations
- **Entities/Models**: Represent domain objects

## Use Design Patterns Appropriately

- **Factory Pattern**: Create objects without specifying exact class
- **Strategy Pattern**: Encapsulate algorithms and make them interchangeable
- **Builder Pattern**: Construct complex objects step by step
- **Observer Pattern**: Use Spring Events for decoupled communication

## Package Organization

Use feature-based packaging for better modularity:
```
com.company.app
├── order (feature)
├── product (feature)
└── customer (feature)
```

Each feature contains: controller, service, repository, model, dto

## Best Practices
- Keep methods small and focused (under 20 lines)
- Use meaningful names that reveal intent
- Avoid deep nesting (max 3 levels)
- Write testable code with clear dependencies
- Favor composition over inheritance