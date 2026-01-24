---
name: ui-design-guidelines
description: Provides practical guidelines for designing consistent, maintainable, and performant user interfaces in React applications. Use this skill when building, reviewing, or standardizing React-based UIs.
---

Design components to be small, focused, and reusable.
Follow a clear component hierarchy that mirrors the UI structure.
Separate presentational components from stateful or container components.
Lift state up only when multiple components truly need shared state.
Prefer composition over inheritance for UI reuse.
Keep component props explicit and well-typed.
Avoid deeply nested component trees where possible.
Use controlled components for form inputs.
Handle loading, error, and empty states explicitly in the UI.
Ensure consistent spacing, typography, and color usage across components.
Use a centralized theme or design system for styling decisions.
Avoid inline styles for complex layouts; prefer reusable style abstractions.
Ensure components are accessible by default (ARIA roles, keyboard navigation).
Provide meaningful labels and feedback for user interactions.
Avoid unnecessary re-renders by memoizing components when appropriate.
Keep side effects isolated using effect hooks with clear dependencies.
Do not mix data-fetching logic directly into low-level UI components.
Design layouts to be responsive and adaptable to different screen sizes.
Ensure UI behavior is predictable and consistent across similar components.
Document reusable components and their intended usage.
Test UI components in isolation where behavior is non-trivial.
Avoid premature visual optimization that harms clarity or maintainability.
---

