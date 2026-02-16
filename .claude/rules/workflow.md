# Collaboration Workflow

## Session Start (ALWAYS do this first)
1. Run `git pull --rebase` to get the latest changes
2. Read `docs/TASKS.md` and `docs/WORKLOG.md`
3. Summarize what's changed since last session and what tasks are available

## Before Coding
- Claim your task in TASKS.md (move to "In Progress" with your name in bold brackets, e.g. `**[Patrick]**`)
- Never work on a task someone else has claimed in "In Progress"

## After Coding
1. Update TASKS.md (move task to "Done" with completion date)
2. Add a WORKLOG.md entry with date, name, and bullet points of what changed
3. Add any new tasks discovered during development to "Up Next"
4. Run `git pull --rebase` to get any changes before committing
5. Commit all changes (code + coordination files together)
6. **Always ask to push to origin after committing** — say something like "Want me to push these changes so your collaborator can pick them up?"

## Important
- Always commit coordination file updates (TASKS.md, WORKLOG.md) alongside code changes
- If TASKS.md has a merge conflict, resolve by keeping both changes
- If the user forgets to pull or push, remind them
