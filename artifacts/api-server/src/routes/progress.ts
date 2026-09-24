import { and, asc, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { Router, type IRouter, type RequestHandler } from "express";
import { db, progressTable } from "@workspace/db";
import {
  GetMyProgressResponse,
  ListStudentProgressResponse,
  UpdateMyProgressBody,
  UpdateMyProgressResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

function toResponse(row: typeof progressTable.$inferSelect) {
  return GetMyProgressResponse.parse({
    userId: row.userId,
    name: row.name,
    role: row.role,
    teacherClassName: row.teacherClassName,
    teacherClassCode: row.teacherClassCode,
    level: row.level,
    xp: row.xp,
    xpNextLevel: row.xpNextLevel,
    coins: row.coins,
    gems: row.gems,
    streakDays: row.streakDays,
    completedMissions: row.completedMissions,
    selectedThemes: row.selectedThemes,
    ownedItems: row.ownedItems,
    updatedAt: row.updatedAt.toISOString(),
  });
}

function normalizeClassCode(value: string): string {
  return value.trim().toUpperCase();
}

async function createUniqueClassCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `ROB-${randomBytes(3).toString("hex").toUpperCase()}`;
    const [existing] = await db
      .select({ userId: progressTable.userId })
      .from(progressTable)
      .where(eq(progressTable.teacherClassCode, code));

    if (!existing) {
      return code;
    }
  }

  throw new Error("Unable to create a unique class code");
}

export function createProgressRouter(
  authMiddleware: RequestHandler = requireAuth,
): IRouter {
  const router: IRouter = Router();

  router.get("/progress/me", authMiddleware, async (req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, req.auth!.userId));

  if (!row) {
    res.status(404).json({ error: "Progress has not been created yet" });
    return;
  }

  res.json(toResponse(row));
  });

  router.put("/progress/me", authMiddleware, async (req, res): Promise<void> => {
  const parsed = UpdateMyProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, req.auth!.userId));
  const role = parsed.data.role;
  const { updatedAt: clientUpdatedAt, ...progressData } = parsed.data;

  if (existing[0] && existing[0].role !== role) {
    res.status(400).json({ error: "Account role cannot be changed" });
    return;
  }

  let teacherClassCode = normalizeClassCode(parsed.data.teacherClassCode);
  if (role === "teacher") {
    if (existing[0]?.teacherClassCode) {
      if (teacherClassCode && existing[0].teacherClassCode !== teacherClassCode) {
        res.status(400).json({ error: "Teacher class code cannot be changed" });
        return;
      }
      teacherClassCode = existing[0].teacherClassCode;
    } else {
      teacherClassCode = await createUniqueClassCode();
    }
  } else {
    if (!teacherClassCode) {
      res.status(400).json({ error: "A class code is required for students" });
      return;
    }

    const [teacher] = await db
      .select({ userId: progressTable.userId })
      .from(progressTable)
      .where(and(eq(progressTable.role, "teacher"), eq(progressTable.teacherClassCode, teacherClassCode)));

    if (!teacher) {
      res.status(400).json({ error: "Invalid class code" });
      return;
    }
  }

  let row: typeof progressTable.$inferSelect | undefined;
  if (!existing[0]) {
    [row] = await db
      .insert(progressTable)
      .values({
        userId: req.auth!.userId,
        ...progressData,
        teacherClassCode,
        updatedAt: new Date(),
      })
      .returning();
  } else {
    if (!clientUpdatedAt) {
      res.status(409).json({ error: "Progress version is required" });
      return;
    }

    const [updated] = await db
      .update(progressTable)
      .set({ ...progressData, teacherClassCode, updatedAt: new Date() })
      .where(
        and(
          eq(progressTable.userId, req.auth!.userId),
          eq(progressTable.updatedAt, new Date(clientUpdatedAt)),
        ),
      )
      .returning();

    if (!updated) {
      res.status(409).json({ error: "Progress update is stale" });
      return;
    }
    row = updated;
  }

  res.json(UpdateMyProgressResponse.parse(toResponse(row!)));
  });

  router.get("/progress/students", authMiddleware, async (req, res): Promise<void> => {
  const [teacher] = await db
    .select({
      role: progressTable.role,
      teacherClassCode: progressTable.teacherClassCode,
    })
    .from(progressTable)
    .where(eq(progressTable.userId, req.auth!.userId));

  if (!teacher || teacher.role !== "teacher") {
    res.status(403).json({ error: "Teacher access required" });
    return;
  }

  if (!teacher.teacherClassCode) {
    res.json(ListStudentProgressResponse.parse([]));
    return;
  }

  const students = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.role, "student"), eq(progressTable.teacherClassCode, teacher.teacherClassCode)))
    .orderBy(asc(progressTable.name));

  res.json(ListStudentProgressResponse.parse(students.map(toResponse)));
  });

  return router;
}

export default createProgressRouter();