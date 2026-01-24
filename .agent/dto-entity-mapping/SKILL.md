---
name: dto-entity-mapping
description: Defines how to map between Data Transfer Objects (DTOs) and domain entities cleanly and safely. Use this skill when designing service boundaries, API layers, or persistence interactions.
---

Keep DTOs and entities strictly separated; never expose entities directly outside the domain or persistence layer.
Design DTOs to match use-cases, not database structure.
Avoid bidirectional mapping unless there is a clear and justified need.
Centralize mapping logic using dedicated mappers or mapping layers.
Ensure mappings are explicit; avoid reflection-based or magic mappings for critical paths.
Prevent business logic from leaking into DTOs; keep them as simple data carriers.
Validate incoming DTOs before mapping them to entities.
Handle nullability and optional fields deliberately during mapping.
Avoid overwriting entity state unintentionally when applying update DTOs.
Use immutable DTOs where possible to reduce side effects.
Map identifiers carefully; never trust client-provided IDs for entity identity changes.
Separate create, update, and response DTOs when semantics differ.
Ensure mapping preserves domain invariants and constraints.
Avoid deep object graphs in DTOs; flatten where practical.
Optimize mapping performance for bulk operations.
Write unit tests for complex or critical mappings.
Ensure mapping logic is version-aware when DTOs evolve.
Keep persistence concerns out of DTOs entirely.
---

