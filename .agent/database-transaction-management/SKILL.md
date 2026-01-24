---
name: database-transaction-management
description: Defines how to design, use, and manage database transactions to ensure data consistency, integrity, and reliability. Use this skill when implementing business logic that spans multiple database operations or requires strict consistency guarantees.
---

Apply transactions only where atomicity is required; avoid wrapping unnecessary read-only operations.
Follow ACID principles explicitly, understanding trade-offs between consistency, isolation, and performance.
Choose appropriate isolation levels based on workload characteristics, avoiding default levels blindly.
Keep transactions as short-lived as possible to reduce lock contention and deadlock risk.
Always define clear transaction boundaries in application code rather than relying on implicit behavior.
Handle commit and rollback paths explicitly, including error and timeout scenarios.
Design idempotent operations where feasible to safely support retries.
Detect and handle deadlocks gracefully using retries with backoff strategies.
Avoid long-running user interactions inside transactions.
Ensure consistent ordering of resource access to minimize deadlock probability.
Use optimistic locking for high-concurrency scenarios where conflicts are rare.
Use pessimistic locking only when contention is expected and correctness demands it.
Log transaction failures with sufficient context for debugging and auditing.
Ensure that transaction scope aligns with business invariants, not technical convenience.
Test transaction behavior under concurrent load, not just in single-user scenarios.
Coordinate transactions carefully across services; avoid distributed transactions unless strictly necessary.
Prefer eventual consistency patterns when strict transactions across boundaries are impractical.
---

