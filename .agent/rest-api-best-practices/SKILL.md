---
name: rest-api-best-practices
description: Provides guidance for designing, implementing, and maintaining RESTful APIs following industry best practices. Use this skill whenever an API schema, endpoint design, or backend interface is being planned, reviewed, or optimized.
---

Follow REST architectural principles consistently, using clear resource-based URLs and standard HTTP methods (GET, POST, PUT, PATCH, DELETE).
Enforce proper use of HTTP status codes for success, client errors, and server errors, avoiding custom or misleading codes.
Design endpoints around nouns (resources) rather than verbs, and use plural resource names where appropriate.
Ensure APIs are stateless; do not rely on server-side sessions for request handling.
Use consistent request and response formats, preferably JSON, with predictable field naming conventions.
Implement robust input validation and return meaningful, structured error responses.
Version APIs explicitly (e.g., via URL or headers) to prevent breaking existing clients.
Support pagination, filtering, and sorting for collection endpoints using standard query parameters.
Apply authentication and authorization mechanisms consistently, favoring token-based approaches.
Avoid over-fetching and under-fetching by designing flexible yet constrained response payloads.
Document all endpoints clearly, including request schemas, response schemas, and error cases.
Ensure idempotency where required, especially for PUT and DELETE operations.
Use proper caching headers and semantics to improve performance and scalability.
Log requests and errors in a way that supports debugging without exposing sensitive data.
Design APIs to be backward-compatible whenever possible, and deprecate features gracefully.
---
