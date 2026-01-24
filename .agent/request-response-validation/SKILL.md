---
name: request-response-validation
description: Defines how to validate incoming requests and outgoing responses to ensure correctness, security, and contract stability. Use this skill when designing API layers, service boundaries, or data exchange contracts.
---

Validate all incoming requests at the boundary of the system before business logic execution.
Apply schema-based validation consistently for headers, query parameters, path variables, and bodies.
Fail fast on validation errors and return clear, structured error responses.
Never rely on client-side validation alone; always enforce server-side checks.
Distinguish between syntactic validation (format, type) and semantic validation (business rules).
Normalize and sanitize inputs before further processing.
Use explicit constraints for required fields, ranges, lengths, and formats.
Avoid over-validation that couples APIs tightly to internal models.
Validate authentication and authorization context separately from payload validation.
Ensure error messages are informative but do not leak sensitive implementation details.
Validate responses against defined schemas to prevent accidental contract drift.
Do not expose internal fields or transient state in response payloads.
Ensure response validation does not introduce significant latency in hot paths.
Version validation rules alongside API versions to preserve backward compatibility.
Log validation failures with sufficient context for diagnostics and auditing.
Test validation logic with both valid and adversarial inputs.
Ensure consistent validation behavior across environments and deployments.
Treat validation as part of the API contract, not an implementation detail.
---

