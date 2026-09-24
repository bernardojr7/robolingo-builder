---
name: Class code isolation
description: Security rules for assigning students to teacher classes through persisted codes.
---

Teacher class codes must be generated and owned by the server. A client may submit a code when joining as a student, but a new teacher must never be able to choose or reuse another teacher's code.

**Why:** The student list is an authorization boundary. Accepting arbitrary teacher-provided codes could let a teacher claim another class, while treating an empty legacy code as a real class could expose all older unassigned students.

**How to apply:** Normalize submitted join codes before lookup, require a matching teacher row for students, filter teacher lists by the authenticated teacher's non-empty code, and return no students while a legacy teacher is still waiting for code generation.