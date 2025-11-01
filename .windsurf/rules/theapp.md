---
trigger: manual
---

# Rules for Todo List App Development

## General Development Rules
- Always break down work into atomic, incremental tasks.
- Complete each task fully with tests before proceeding to the next.
- Keep commits small and focused, aligned with individual tasks.
- Document progress and significant changes in `app.md` continuously.
- Avoid breaking changes or removing existing functionality without explicit tasks.

## Task Execution Rules
- Follow the order of tasks exactly as listed in `app.md`.
- Mark tasks complete only after verification and test success.
- Use clear, simple coding conventions consistent throughout the project.
- For API endpoints, validate inputs and handle errors gracefully.
- For UI work, maintain consistent styling and responsiveness.

## Code Quality and Testing
- Write automated unit and integration tests for all new features.
- Test error conditions and edge cases explicitly.
- Use meaningful variable and function names for clarity.
- Refactor only within the scope of the current atomic task.
- Ensure all tests pass before marking the task done.

## Documentation Rules
- Update `app.md` to reflect any changes in task status or specifications.
- Write brief but comprehensive task comments within code.
- Maintain markdown formatting consistency in all documentation files.
- Include examples where appropriate to clarify usage or expected behavior.

## Collaboration Rules
- Review task dependencies and confirm prerequisites are met.
- Raise any blockers or ambiguous requirements promptly for clarification.
- Respect modular design principles and avoid tightly coupled code.
- Communicate progress regularly via task list updates in `app.md`.

