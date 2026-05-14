# Shared UI Standards

These standards define ownership for reusable UI primitives so feature pages do not fork common behavior.

## Primitive Ownership

- `src/shared/ui` owns generic primitives that are independent of a product domain: loaders, forms, toggles, media controls, skeletons, and low-level display helpers.
- `src/components/ui` owns app-level composition components that may depend on the dashboard shell or broader application styling.
- Feature folders own domain-specific components when labels, data shape, or behavior are tied to a workflow such as courses, attendance, admin, or sessions.

## API Rules

- Shared primitives should accept explicit props instead of reading feature context directly.
- Shared primitives should expose stable accessibility props such as `aria-label`, `id`, `htmlFor`, and focus handling hooks when needed.
- Shared primitives should not perform route navigation, API calls, toast messages, or role checks.
- Domain components may compose shared primitives and own workflow-specific side effects.

## Styling Rules

- Shared primitives should use existing Tailwind tokens and current dark-mode patterns.
- Shared primitives should avoid page-level spacing, section backgrounds, or layout assumptions.
- Feature components own page density, section spacing, and workflow-specific labels.

## Refactor Policy

- Promote a feature component into shared UI only after it is used in at least two domains or after a concrete second usage is being implemented.
- Move behavior with tests or a focused smoke check when the component owns keyboard, focus, validation, or loading states.
- Keep exports narrow. Prefer one default primitive per file plus small named helpers only when they are part of the public API.
