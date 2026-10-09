---
name: rvip-lab-delivery
description: >-
  End-to-end delivery of an RViP lab in this NestJS monorepo: map methodichka
  requirements, follow OpenSpec, implement services, update compose/postman/README,
  and prepare defense notes. Use when starting or finishing lab-N work.
---

# RViP lab delivery

## When to use

User asks to do / finish / prepare a lab (`lab-4`, `lab-5`, …) or “сделай по методичке”.

## Steps

1. Read `task/task.md` section for that lab + current branch (`git branch --show-current`).
2. If service boundaries or API contracts change and no OpenSpec change exists → run propose workflow first (`/opsx-propose` / `openspec-propose`). Do not skip for greenfield services.
3. Work as **Implementer** against `tasks.md` only.
4. Checklist for every new/changed service:
   - [ ] nest-cli + package scripts
   - [ ] Dockerfile
   - [ ] `/health`
   - [ ] APM bootstrap if stack already has Elastic APM
   - [ ] compose service + env in `.env.example`
   - [ ] Postman happy-path
   - [ ] README demo commands
5. Map Spring terms → Nest in README (one short paragraph).
6. Hand off to skill `rvip-verify-stack` before claiming done.
7. Remind human to push branch; do not force-push.

## Lab-specific anchors

| Lab | Must show |
|-----|-----------|
| 4 | CSV report stored via HttpService into object storage (MinIO) |
| 5 | Same payload path via queue (no sync HttpService to storage) |
| 6+ | see `task/task.md` |

## Anti-patterns

- Implementing lab-5 queue while on lab-4.
- Hosting report/file internals publicly when lab says hide them.
- Local `./data` folder instead of real object storage when MinIO is in scope.
