---
name: springboot-microservice-setup
description: Provides instructions for building Spring Boot microservices with Maven and Java, emphasizing code reusability, modularity, and best practices. Use this when the developer needs guidance on microservice architecture, shared libraries, or Spring Boot project structure.
---

# Spring Boot Microservices with Code Reusability

## Project Structure

Create a multi-module Maven project structure:
```
parent-project/
├── pom.xml (parent POM)
├── common-library/
│   ├── pom.xml
│   └── src/main/java/
├── service-a/
│   ├── pom.xml
│   └── src/main/java/
├── service-b/
│   ├── pom.xml
│   └── src/main/java/
└── service-c/
    ├── pom.xml
    └── src/main/java/
```

## Parent POM Configuration

In the root `pom.xml`, define:
- Common dependencies with version management
- Shared properties (Java version, Spring Boot version)
- Plugin configurations
- Modules list
```xml
<modules>
    <module>common-library</module>
    <module>service-a</module>
    <module>service-b</module>
</modules>
```

## Common Library Module

Create a shared `common-library` module containing:
- **DTOs and Models**: Request/response objects, domain entities
- **Utilities**: Date handlers, string formatters, validation helpers
- **Exception Handlers**: Custom exceptions, global exception handlers with `@ControllerAdvice`
- **Configuration Classes**: Common security, CORS, logging configurations
- **Constants**: API endpoints, error codes, application constants
- **Base Classes**: Abstract controllers, base service classes
- **Annotations**: Custom validation annotations, method-level security annotations

Each microservice includes this dependency:
```xml
<dependency>
    <groupId>com.yourcompany</groupId>
    <artifactId>common-library</artifactId>
    <version>${project.version}</version>
</dependency>
```

## Code Reusability Patterns

### 1. Abstract Base Services
Create abstract service classes in common-library:
```java
public abstract class BaseService<T, ID> {
    protected abstract JpaRepository<T, ID> getRepository();
    
    public T save(T entity) {
        return getRepository().save(entity);
    }
    
    public Optional<T> findById(ID id) {
        return getRepository().findById(id);
    }
}
```

### 2. Generic Response Wrappers
```java
public class ApiResponse<T> {
    private T data;
    private String message;
    private boolean success;
    // constructors, getters, setters
}
```

### 3. Reusable Configuration
- Security configurations (JWT filters, authentication)
- Database configurations (connection pooling, JPA settings)
- Logging and monitoring (Sleuth, MDC configurations)
- Swagger/OpenAPI documentation setup

### 4. Shared Interceptors and Filters
- Authentication filters
- Request/response logging interceptors
- Rate limiting filters
- Correlation ID generators

## Microservice Individual Responsibilities

Each microservice should:
- Have a single, well-defined business responsibility
- Maintain its own database schema
- Expose RESTful APIs or messaging interfaces
- Include service-specific business logic only
- Use the common-library for shared functionality

## Communication Between Services

Choose appropriate patterns:
- **REST APIs**: Using `RestTemplate` or `WebClient` from common-library
- **Message Queues**: RabbitMQ, Kafka with shared message DTOs
- **Service Discovery**: Eureka, Consul for dynamic service location
- **API Gateway**: Spring Cloud Gateway for routing and common concerns

## Configuration Management

Use Spring Cloud Config or externalized configuration:
- `application.yml` for service-specific settings
- `application-common.yml` in common-library for shared settings
- Environment-specific profiles (dev, staging, prod)

## Dependency Injection Best Practices

- Use constructor injection over field injection
- Define interfaces in common-library, implementations in services
- Leverage `@ConditionalOnProperty` for feature toggles
- Use `@ConfigurationProperties` for type-safe configuration

## Testing Strategy

In common-library, provide:
- Abstract test classes with common setup
- Test utilities and data builders
- Mock configurations
- Shared test dependencies in `dependencyManagement`

Each microservice includes:
- Unit tests for service logic
- Integration tests with `@SpringBootTest`
- Contract tests for API compatibility

## Build and Deployment

Configure Maven plugins in parent POM:
- `spring-boot-maven-plugin` for executable JARs
- `maven-compiler-plugin` with Java version
- `maven-surefire-plugin` for testing
- `dockerfile-maven-plugin` for containerization

Build command: `mvn clean install` from parent directory to build all modules.

## Best Practices

1. **Version all modules together** using parent POM version
2. **Keep common-library lightweight** - avoid heavy dependencies
3. **Document shared components** thoroughly
4. **Use semantic versioning** for common-library releases
5. **Implement health checks** (`/actuator/health`) in all services
6. **Externalize secrets** - never hardcode credentials
7. **Enable distributed tracing** with Spring Cloud Sleuth
8. **Implement circuit breakers** with Resilience4j for service calls
9. **Use feature flags** for gradual rollouts
10. **Maintain API versioning** strategy (URL or header-based)