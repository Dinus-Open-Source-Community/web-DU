# Redis Implementation

## A. Architecture Changes

- Added reusable Redis cache utilities under `backend/internal/cache/`.
- `go-redis/v9` creates one pooled client during backend startup.
- Redis remains optional. `REDIS_ENABLED=false` disables cache; unavailable Redis falls back to PostgreSQL.
- Cache-aside response middleware caches only successful JSON GET responses.
- Namespace versions provide coarse invalidation without wildcard deletion. Version-checked Lua writes prevent stale in-flight fills after invalidation.
- Singleflight coalesces same-process concurrent misses.
- Redis health, hit/miss/error counts, average command latency, and hit ratio are logged without values.

## B. Redis Configuration

Set variables in root `.env` or backend environment:

```env
REDIS_ENABLED=true
REDIS_ADDR=redis:6379
REDIS_PASSWORD=use-a-strong-private-secret
REDIS_DB=0
REDIS_POOL_SIZE=20
REDIS_DIAL_TIMEOUT=5s
REDIS_READ_TIMEOUT=3s
REDIS_WRITE_TIMEOUT=3s
REDIS_AUTH_CACHE_TTL=45s
```

Auth TTL validation accepts only 30–60 seconds. Invalid values stop startup with an explicit configuration error.
Docker Compose uses an internal Redis service with password support and health check. It publishes no Redis port.
Backend startup does not wait for Redis health; unavailable Redis falls back to PostgreSQL.
Compose enables Redis by default; local backend environment example disables it by default.

## C. TTL Matrix

TTL constants live in `backend/internal/cache/ttl.go`.

| Implemented response cache | TTL |
|---|---:|
| Course category list and detail | 6 hours |
| Course type list and detail | 6 hours |
| Public gallery list and detail | 1 hour |
| Public mentor directory list | 30 minutes |
| Public course catalog | 15 minutes |
| Public course detail | 15 minutes |
| Course mentors | 15 minutes |
| Auth claims session | 45 seconds by default; configurable 30–60 seconds |

Additional operational TTL constants exist for planned integrations but are not active cache targets.
General cache TTL receives ±10% jitter. Auth TTL has no jitter and stays in configured bounds.

## D. Cache Key Registry

Keys begin with `dkelas:`. Query parameters normalize whitespace and order, then use full SHA-256 digests.

- `dkelas:course:list:v{version}:{request_hash}`
- `dkelas:course:detail:v{version}:{request_hash}`; path contains full canonical UUID.
- `dkelas:course:mentors:v{version}:{request_hash}`; path contains full canonical UUID.
- `dkelas:course:categories:v{version}:{request_hash}`
- `dkelas:course:types:v{version}:{request_hash}`
- `dkelas:gallery:list:v{version}:{request_hash}`
- `dkelas:gallery:list:detail:v{version}:{request_hash}`
- `dkelas:mentor:public:list:v{version}:{request_hash}`
- `dkelas:auth:session:{email_hash}`
- Namespace versions: `dkelas:version:{namespace}`; per-user auth versions: `dkelas:version:auth:session:{email_hash}`.

Response cache middleware excludes non-200 responses, non-JSON content, and responses setting cookies. Auth values contain only canonical UID, role, and verification status.

## E. Invalidation Mapping

- Course create, update, deactivate, and status update invalidate course catalog, course detail, course mentors, category and type response namespaces.
- Category create/update/delete invalidates category and catalog namespaces.
- Course type create/update/delete invalidates type and catalog namespaces.
- Gallery create/update/delete invalidates gallery list and detail namespaces.
- Mentor assign/unassign invalidates course, course-mentor, and public mentor list namespaces.
- Module create/update/delete invalidates module list and course detail namespaces. Cascaded module deletion also invalidates lesson and assignment namespaces.
- Lesson create/update/delete invalidates lesson, module list, course detail, and assignment namespaces where applicable.
- Assignment create/update/delete invalidates assignment configuration and course detail namespaces.
- Lesson read, assignment submission, and grading invalidate course detail namespace.
- Review create/reply invalidates course list and detail namespaces.
- Participant add and course redemption are not cached as transactions. Participant addition invalidates the course namespaces.
- Role changes, batch role changes, user deletion, verification, OAuth/SSO identity refresh, email change, and profile updates invalidate auth session keys.

Invalidation is best-effort after successful database writes or commits. Failures log and rely on TTL expiry.

## F. Authentication Cache

`AuthMiddleware` still validates JWT signature and expiration first. It then checks `dkelas:auth:session:{email_hash}` for UID, role, and `is_verified`.
Redis misses/errors query PostgreSQL using the prior `email_hash` lookup. PostgreSQL failure or unverified/missing user still rejects the request.
Password changes do not revoke existing JWTs in current application behavior. The cache does not claim otherwise.
Auth namespace version checks and atomic write guards prevent a cache fill racing with auth invalidation.

## G. Security Considerations

- Redis has no host-published port in Compose.
- Enable `REDIS_PASSWORD` for protected deployments; use private networking and TLS when Redis crosses an untrusted network.
- Cache values never appear in logs.
- Cached endpoint responses are currently public data only. Auth cache stores minimum authorization fields and is keyed by blind email hash.
- No passwords, JWTs, OTPs, reset tokens, redeem execution, transaction results, or S3 binaries are cached.
- Redis invalidation does not clear browser TanStack Query caches on other clients. Existing frontend mutation hooks continue invalidating local query keys. No cross-user real-time mechanism exists.

## H. Testing Results

- Added miniredis tests for miss/hit/expiry, version invalidation and late fill, auth cache TTL and invalidation, Redis failure fallback, config TTL bounds, key normalization, JSON decode errors, and TTL jitter.
- Added HTTP cache tests for response hit, normalized filter separation, and namespace invalidation.
- `go test ./...`: **29 tests passed across 13 packages**.
- `go test -race ./internal/cache ./internal/handler/middleware`: passed.
- `docker compose config --quiet`: passed with warnings for unset optional SSO variables.
- `git diff --check`: passed.
- Existing frontend query defaults remain unchanged (`staleTime` 5 minutes, `gcTime` 30 minutes).
- No production deployment or benchmark was run.

## I. Performance Considerations

Cache hits avoid service execution for the public response targets and avoid the auth middleware user lookup. No numerical speedup is claimed without a workload benchmark.

## J. Remaining Tasks

- Operational dashboards, user profile, assignments, submissions, roster, moderation, and redeem-code directory response caching remain disabled.
- Lesson/module/assignment response caching has TTL constants and invalidation groundwork but is not activated on protected routes. Those routes perform authorization/ownership checks inside handlers; caching before those checks could leak access-controlled content.
- Mentor detail (`GET /mentor/:id`) is not cached because response includes email and review data; only the public mentor list is cached.
- Review/Q&A mutations and several write paths outside the active cached public namespaces may need broader invalidation as more datasets are enabled.
- No live Redis integration benchmark, cross-instance stress test, or frontend build was run.
- Global Gin request logging behavior is unchanged. Redis cache logging omits values and identifiers.
