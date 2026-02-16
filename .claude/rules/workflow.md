# Collaboration Workflow

1. At session start: read `docs/PLAN.md`, then `docs/WORKLOG.md`, then `docs/TASKS.md`
2. Before coding: claim your task in TASKS.md (move to "In Progress" with your name in bold brackets, e.g. `**[Patrick]**`)
3. After coding:
   - Update TASKS.md (move task to "Done" with completion date)
   - Add a WORKLOG.md entry
   - Update PLAN.md **if the plan changed** (note who revised it, when, and why)
4. Before committing: `git pull --rebase` to avoid conflicts
5. If TASKS.md has a conflict, resolve by keeping both changes
6. Never work on a task someone else has claimed in "In Progress"
7. Add new tasks to "Up Next" as you discover them during development

## Using Gemini for Planning

- PLAN.md is the source of truth, not Gemini conversations
- When starting a new Gemini session, paste PLAN.md contents for context
- After refining a phase in Gemini, update PLAN.md and include the Gemini share link
- Log Gemini session links in WORKLOG.md entries for traceability
