---
name: exception-error-handling
description: Provides comprehensive instructions for implementing proper exception and error handling in Spring Boot applications with user-friendly messages. Use this when the developer needs guidance on creating centralized exception handling, custom exceptions, error responses, and best practices for communicating errors to end users.
---

# Exception and Error Handling with User-Friendly Messages

## Global Exception Handler

Create a centralized exception handler using `@ControllerAdvice`:
```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Resource Not Found")
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();
        
        log.error("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, WebRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Bad Request")
            .message(ex.getMessage())
            .path(request.getDescription(false).replace("uri=", ""))
            .build();
        
        log.warn("Bad request: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message("An unexpected error occurred. Please try again later.")
            .path(request.getDescription(false).replace("uri=", ""))
            .build();
        
        log.error("Unexpected error: ", ex);
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## Standard Error Response Structure

Create a consistent error response model:
```java
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<ValidationError> validationErrors;
    private String traceId; // For distributed tracing
}

@Data
@Builder
public class ValidationError {
    private String field;
    private String message;
    private Object rejectedValue;
}
```

## Custom Exception Hierarchy

Define domain-specific exceptions:
```java
// Base exception
public class BaseApplicationException extends RuntimeException {
    private final String userMessage;
    private final String errorCode;
    
    public BaseApplicationException(String userMessage, String errorCode) {
        super(userMessage);
        this.userMessage = userMessage;
        this.errorCode = errorCode;
    }
    
    public String getUserMessage() {
        return userMessage;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

// Specific exceptions
public class ResourceNotFoundException extends BaseApplicationException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(
            String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue),
            "RESOURCE_NOT_FOUND"
        );
    }
}

public class BadRequestException extends BaseApplicationException {
    public BadRequestException(String message) {
        super(message, "BAD_REQUEST");
    }
}

public class UnauthorizedException extends BaseApplicationException {
    public UnauthorizedException(String message) {
        super(message != null ? message : "You are not authorized to access this resource", 
              "UNAUTHORIZED");
    }
}

public class ForbiddenException extends BaseApplicationException {
    public ForbiddenException(String message) {
        super(message != null ? message : "You don't have permission to perform this action", 
              "FORBIDDEN");
    }
}

public class DuplicateResourceException extends BaseApplicationException {
    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(
            String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue),
            "DUPLICATE_RESOURCE"
        );
    }
}

public class BusinessValidationException extends BaseApplicationException {
    public BusinessValidationException(String message) {
        super(message, "BUSINESS_VALIDATION_ERROR");
    }
}
```

## Validation Error Handling

Handle `@Valid` and `@Validated` annotation errors:
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidationErrors(
        MethodArgumentNotValidException ex, WebRequest request) {
    
    List<ValidationError> validationErrors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(error -> ValidationError.builder()
            .field(error.getField())
            .message(error.getDefaultMessage())
            .rejectedValue(error.getRejectedValue())
            .build())
        .collect(Collectors.toList());
    
    ErrorResponse error = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Validation Failed")
        .message("Please correct the following errors and try again")
        .validationErrors(validationErrors)
        .path(request.getDescription(false).replace("uri=", ""))
        .build();
    
    log.warn("Validation errors: {}", validationErrors);
    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
}

@ExceptionHandler(ConstraintViolationException.class)
public ResponseEntity<ErrorResponse> handleConstraintViolation(
        ConstraintViolationException ex, WebRequest request) {
    
    List<ValidationError> validationErrors = ex.getConstraintViolations()
        .stream()
        .map(violation -> ValidationError.builder()
            .field(violation.getPropertyPath().toString())
            .message(violation.getMessage())
            .rejectedValue(violation.getInvalidValue())
            .build())
        .collect(Collectors.toList());
    
    ErrorResponse error = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .status(HttpStatus.BAD_REQUEST.value())
        .error("Validation Failed")
        .message("Please provide valid input")
        .validationErrors(validationErrors)
        .path(request.getDescription(false).replace("uri=", ""))
        .build();
    
    return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
}
```

## Database Exception Handling

Handle common database exceptions:
```java
@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
        DataIntegrityViolationException ex, WebRequest request) {
    
    String userMessage = "Unable to process request due to data constraint violation";
    
    // Check for specific constraint violations
    if (ex.getMessage().contains("unique constraint") || 
        ex.getMessage().contains("Duplicate entry")) {
        userMessage = "A record with this information already exists";
    } else if (ex.getMessage().contains("foreign key constraint")) {
        userMessage = "Cannot delete this record as it is referenced by other data";
    }
    
    ErrorResponse error = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .status(HttpStatus.CONFLICT.value())
        .error("Data Conflict")
        .message(userMessage)
        .path(request.getDescription(false).replace("uri=", ""))
        .build();
    
    log.error("Data integrity violation: {}", ex.getMessage());
    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
}

@ExceptionHandler(EmptyResultDataAccessException.class)
public ResponseEntity<ErrorResponse> handleEmptyResultDataAccess(
        EmptyResultDataAccessException ex, WebRequest request) {
    
    ErrorResponse error = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .status(HttpStatus.NOT_FOUND.value())
        .error("Resource Not Found")
        .message("The requested resource could not be found")
        .path(request.getDescription(false).replace("uri=", ""))
        .build();
    
    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
}
```

## User-Friendly Message Constants

Create a message constants class:
```java
public class ErrorMessages {
    // User management
    public static final String USER_NOT_FOUND = "User account not found. Please check your credentials.";
    public static final String USER_ALREADY_EXISTS = "An account with this email already exists.";
    public static final String INVALID_CREDENTIALS = "Invalid email or password. Please try again.";
    public static final String ACCOUNT_LOCKED = "Your account has been locked. Please contact support.";
    
    // Resource operations
    public static final String RESOURCE_NOT_FOUND = "The requested item could not be found.";
    public static final String RESOURCE_DELETED = "This item has been deleted and is no longer available.";
    public static final String DUPLICATE_RESOURCE = "An item with this information already exists.";
    
    // Permissions
    public static final String UNAUTHORIZED_ACCESS = "Please log in to access this feature.";
    public static final String INSUFFICIENT_PERMISSIONS = "You don't have permission to perform this action.";
    
    // General errors
    public static final String INVALID_INPUT = "Please check your input and try again.";
    public static final String SERVER_ERROR = "Something went wrong on our end. Please try again later.";
    public static final String SERVICE_UNAVAILABLE = "This service is temporarily unavailable. Please try again in a few minutes.";
    
    private ErrorMessages() {}
}
```

## Internationalization (i18n) Support

Support multiple languages for error messages:
```java
@Component
public class MessageSourceService {
    
    @Autowired
    private MessageSource messageSource;
    
    public String getMessage(String code, Object... args) {
        return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
    }
    
    public String getMessage(String code, Locale locale, Object... args) {
        return messageSource.getMessage(code, args, locale);
    }
}

// Usage in exception handler
@Autowired
private MessageSourceService messageSourceService;

@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex, WebRequest request) {
    
    String localizedMessage = messageSourceService.getMessage(
        "error.resource.not.found", 
        ex.getResourceName()
    );
    
    // ... rest of handler
}
```

Create `messages.properties` files:
```properties
# messages.properties (default - English)
error.resource.not.found=The requested {0} could not be found
error.user.already.exists=An account with this email already exists
error.invalid.credentials=Invalid email or password

# messages_es.properties (Spanish)
error.resource.not.found=El {0} solicitado no pudo ser encontrado
error.user.already.exists=Ya existe una cuenta con este correo electrónico
error.invalid.credentials=Correo electrónico o contraseña inválidos
```

## Logging Best Practices

Implement proper logging levels:
```java
@ExceptionHandler(BaseApplicationException.class)
public ResponseEntity<ErrorResponse> handleBaseApplicationException(
        BaseApplicationException ex, WebRequest request) {
    
    // Log technical details with appropriate level
    if (ex instanceof ResourceNotFoundException) {
        log.info("Resource not found: {}", ex.getMessage());
    } else if (ex instanceof BadRequestException) {
        log.warn("Bad request: {}", ex.getMessage());
    } else {
        log.error("Application exception: {}", ex.getMessage(), ex);
    }
    
    // Return user-friendly message
    ErrorResponse error = ErrorResponse.builder()
        .timestamp(LocalDateTime.now())
        .status(determineHttpStatus(ex).value())
        .error(ex.getErrorCode())
        .message(ex.getUserMessage())
        .path(request.getDescription(false).replace("uri=", ""))
        .build();
    
    return new ResponseEntity<>(error, determineHttpStatus(ex));
}

private HttpStatus determineHttpStatus(BaseApplicationException ex) {
    if (ex instanceof ResourceNotFoundException) return HttpStatus.NOT_FOUND;
    if (ex instanceof UnauthorizedException) return HttpStatus.UNAUTHORIZED;
    if (ex instanceof ForbiddenException) return HttpStatus.FORBIDDEN;
    if (ex instanceof DuplicateResourceException) return HttpStatus.CONFLICT;
    return HttpStatus.BAD_REQUEST;
}
```

## Exception Handling in Service Layer

Use proper exception handling in services:
```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }
    
    public UserDTO createUser(CreateUserRequest request) {
        // Check for duplicates
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }
        
        // Business validation
        if (request.getAge() < 18) {
            throw new BusinessValidationException("User must be at least 18 years old");
        }
        
        User user = new User();
        // ... set properties
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }
    
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        
        try {
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessValidationException(
                "Cannot delete user because they have associated records"
            );
        }
    }
}
```

## Async Exception Handling

Handle exceptions in async methods:
```java
@Configuration
public class AsyncConfiguration implements AsyncConfigurer {
    
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }
}

public class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
    
    private static final Logger log = LoggerFactory.getLogger(CustomAsyncExceptionHandler.class);
    
    @Override
    public void handleUncaughtException(Throwable ex, Method method, Object... params) {
        log.error("Async exception in method: {} with parameters: {}", 
                  method.getName(), Arrays.toString(params), ex);
        
        // Send notification, create alert, etc.
    }
}
```

## Best Practices

1. **Never expose sensitive information** in error messages (stack traces, database details, internal IDs)
2. **Use specific exceptions** instead of generic RuntimeException
3. **Log technical details** but return user-friendly messages
4. **Provide actionable guidance** in error messages when possible
5. **Use consistent error codes** across the application
6. **Include correlation/trace IDs** for debugging in distributed systems
7. **Avoid null pointer exceptions** by using Optional and proper null checks
8. **Handle third-party API failures** gracefully with fallback messages
9. **Test exception scenarios** with unit and integration tests
10. **Document error responses** in API documentation (Swagger/OpenAPI)
11. **Monitor exception metrics** to identify patterns and issues
12. **Use circuit breakers** for external service failures