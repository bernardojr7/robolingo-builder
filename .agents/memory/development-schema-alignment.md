---
name: Development schema alignment
description: Development database schema drift that affects database-backed route tests.
---

Database-backed integration tests must run against a development database whose schema matches the current Drizzle source.

**Why:** The development database can retain an older table shape and produce misleading route failures such as a missing column even when the TypeScript schema and handler are correct.

**How to apply:** Before trusting a database-backed integration-test failure, compare the development schema with the source and apply the documented development-only schema push. Never write schema changes to production from the test workflow.