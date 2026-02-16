# Collaboration Workflow

1. At session start: read `docs/TASKS.md` and `docs/WORKLOG.md`
2. Before coding: claim your task in TASKS.md (move to "In Progress" with your name in bold brackets, e.g. `**[Patrick]**`)
3. After coding: update TASKS.md (move task to "Done" with completion date) and add a WORKLOG.md entry
4. Before committing: `git pull --rebase` to avoid conflicts
5. If TASKS.md has a conflict, resolve by keeping both changes
6. Never work on a task someone else has claimed in "In Progress"
7. Add new tasks to "Up Next" as you discover them during development
