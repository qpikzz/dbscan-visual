# Agent Instructions

These instructions apply to every agent working in this repository. Follow them before and throughout each task.

## Before starting

1. Read `openspec/RULES.md` before taking action on the task.
2. Read the relevant files in `openspec/specs/` before starting every task. Treat those specs as the source of truth; do not invent requirements.
3. Create a task note in `openspec/tasks/` before implementation, following the naming format and required contents in `openspec/RULES.md`. Every task requires a detailed plan, a todo list, and a final report, including single-step tasks.
4. If the task is multi-step, create and maintain a todo list before implementation. Before major changes, briefly describe the plan and wait for user confirmation.

## While working

- Keep changes scoped to the user's request and follow `openspec/RULES.md` and the relevant specifications.
- If a specification conflicts with the user's request, follow the request, report the conflict, and suggest updating the specification.
- Update the task note's todo statuses as work progresses. If work is delegated, give each delegated agent the relevant repository instructions and incorporate its results into the task note and final report.
- Do not add dependencies without user approval.
- Update the corresponding specification in the same task when changing behavior, design, or the technology stack.

## Before finishing

1. Run the verification required by `openspec/RULES.md` (`npm run build`); do not start a background development server to smoke-test the site.
2. Record the outcome, changed files, and any unverified checks or blockers in the task note's final report. Mark todo items complete only when they are done.
3. Do not consider the task complete until the task note has its final report. Give the user a concise final response with the result and verification outcome.
