---
name: audit-logging
description: Defines how to design and implement audit logs to track security-relevant and business-critical actions. Use this skill when building systems that require traceability, compliance, or forensic analysis.
---

Log all security-sensitive actions such as authentication events, authorization changes, and privilege escalations.
Capture who performed the action, what was done, when it occurred, and where it originated from.
Ensure audit logs are immutable or append-only to prevent tampering.
Separate audit logs from application debug or access logs.
Use consistent, structured log formats to support querying and analysis.
Avoid logging sensitive data such as passwords, secrets, or full personal identifiers.
Apply data masking or tokenization where partial identifiers are required.
Ensure timestamps are recorded in a consistent timezone, preferably UTC.
Correlate audit events with request or transaction identifiers.
Ensure audit logging cannot be bypassed by application logic errors.
Design logging to be resilient; failures in audit logging must be detected and surfaced.
Control access to audit logs strictly and log access attempts themselves.
Define clear retention and archival policies aligned with compliance requirements.
Ensure logs are searchable and exportable for audits and investigations.
Document all auditable events and their expected log structure.
Test audit logging under normal and failure scenarios.
Avoid excessive verbosity that obscures meaningful audit signals.
Review audit logs periodically to detect anomalies and policy violations.
---

