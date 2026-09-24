import { eq, asc } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, progressTable } from "@workspace/db";
import {
  GetMyProgressResponse,
  ListStudentProgressResponse,
  UpdateMyProgressBody,
  UpdateMyProgressResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function toResponse(row: typeof progressTable.$inferSelect) {
  return GetMyProgressResponse.parse({
    userId: row.userId,
    name: row.name,
    role: row.role,
    teacherClassName: row.teacherClassName,
    level: row.level,
    xp: row.xp,
    xpNextLevel: row.xpNextLevel,
    coins: row.coins,
    gems: row.gems,
    streakDays: row.streakDays,
    completedMissions: row.completedMissions,
    selectedThemes: row.selectedThemes,
    ownedItems: row.ownedItems,
  });
}

router.get("/progress/me", requireAuth, async (req, res): Promise<void> => {
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

router.put("/progress/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMyProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select({ role: progressTable.role })
    .from(progressTable)
    .where(eq(progressTable.userId, req.auth!.userId));
  const role = parsed.data.role;

  if (existing[0] && existing[0].role !== role) {
    res.status(400).json({ error: "Account role cannot be changed" });
    return;
  }

  const [row] = await db
    .insert(progressTable)
    .values({
      userId: req.auth!.userId,
      ...parsed.data,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: progressTable.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  res.json(UpdateMyProgressResponse.parse(toResponse(row)));
});

router.get("/progress/students", requireAuth, async (req, res): Promise<void> => {
  const [teacher] = await db
    .select({ role: progressTable.role })
    .from(progressTable)
    .where(eq(progressTable.userId, req.auth!.userId));

  if (!teacher || teacher.role !== "teacher") {
    res.status(403).json({ error: "Teacher access required" });
    return;
  }

  const students = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.role, "student"))
    .orderBy(asc(progressTable.name));

  res.json(ListStudentProgressResponse.parse(students.map(toResponse)));
});

export default router;