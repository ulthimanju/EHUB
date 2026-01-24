---
name: cors-configuration
description: Defines how to configure Cross-Origin Resource Sharing (CORS) securely and correctly for web APIs. Use this skill when exposing APIs to browsers or managing cross-origin access.
---

Enable CORS only when browser-based cross-origin access is required.
Prefer explicit allowlists for origins; avoid wildcard origins in production.
Never combine wildcard origins with credentials support.
Restrict allowed HTTP methods to only those required by the API.
Restrict allowed headers to a minimal, known set.
Expose only necessary response headers to the client.
Handle preflight (OPTIONS) requests efficiently and consistently.
Cache preflight responses appropriately using Access-Control-Max-Age.
Configure CORS at the edge or gateway layer when possible.
Ensure CORS configuration is environment-specific and reviewable.
Avoid duplicating CORS logic across multiple services.
Validate that CORS settings align with authentication and authorization models.
Do not use CORS as a security boundary; treat it as a browser enforcement mechanism.
Test CORS behavior with real browsers, not just HTTP clients.
Log and monitor CORS-related errors for misconfiguration detection.
Document allowed origins and access patterns clearly.
Review CORS rules regularly as clients and domains evolve.
Fail closed when configuration is invalid or ambiguous.
---

