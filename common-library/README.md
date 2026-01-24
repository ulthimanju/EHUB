# Common Library

The Common Library is a shared Maven module containing reusable components, DTOs, utilities, and configurations used across all microservices.

## Contents

### 1. Exception Handling
- `GlobalExceptionHandler`: Centralized error handling using `@ControllerAdvice`.
- `ErrorResponse`: Standardized JSON error response structure.
- `ResourceNotFoundException`: Standard exception for 404 errors.
- `BaseApplicationException`: Base class for custom application exceptions.

### 2. DTOs
- Common data transfer objects (if any generic ones are added).

### 3. Utilities
- Shared utility classes (e.g., DateUtils, ValidationUtils).

## How to Use

Add the following dependency to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>common-library</artifactId>
    <version>${project.version}</version>
</dependency>
```

Ensure your Spring Boot application scans the common packages:

```java
@SpringBootApplication
@ComponentScan(basePackages = {"com.example.yourservice", "com.example.common"})
public class YourServiceApplication { ... }
```
