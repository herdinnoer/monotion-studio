# Arkana

- Use the existing project architecture.
- Reuse existing components and styles.
- Do not install new packages unless explicitly requested.
- Do not modify unrelated files.
- Keep existing routes working.
- Use TypeScript.
- Prefer simple, maintainable code.
- Run relevant checks and fix errors before finishing.

# UI & Styling Guidelines

- STRICTLY use Chakra UI v3 for all styling and UI components.
- Do NOT use Tailwind CSS, inline styles, or standard HTML elements for styling. Always prefer Chakra components (e.g., use `<Box>` instead of `<div>`, `<Text>` instead of `<span>`, `<Flex>` instead of `<div className="flex">`).
- Follow Chakra UI v3 syntax conventions (e.g., use the `gap` prop instead of `spacing` for Stack components, use the boolean `truncate` instead of `isTruncated`).
