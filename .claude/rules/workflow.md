# Collaboration Workflow

## Session Start
1. Read `docs/PLAN.md`, then `docs/WORKLOG.md`, then `docs/TASKS.md`
2. Claim your task in TASKS.md (move to "In Progress" with your name in bold brackets, e.g. `**[Patrick]**`)
3. Never work on a task someone else has claimed in "In Progress"

## After Coding
1. Update TASKS.md (move task to "Done" with completion date)
2. Add a WORKLOG.md entry with date, name, and bullet points of what changed
3. Update PLAN.md **if the plan changed** (note who revised it, when, and why)
4. Add any new tasks discovered during development to "Up Next"
5. Run `git pull --rebase` before committing
6. Commit all changes (code + coordination files together)
7. **Always ask to push to origin after committing** — say something like "Want me to push these changes so your collaborator can pick them up?"

## Using Gemini for Planning
- PLAN.md is the source of truth, not Gemini conversations
- When starting a new Gemini session, paste PLAN.md contents for context
- After refining a phase in Gemini, update PLAN.md and include the Gemini share link
- Log Gemini session links in WORKLOG.md entries for traceability

## Important
- Always commit coordination file updates (TASKS.md, WORKLOG.md, PLAN.md) alongside code changes
- If TASKS.md or PLAN.md has a merge conflict, resolve by keeping both changes
- If the user forgets to pull or push, remind them
