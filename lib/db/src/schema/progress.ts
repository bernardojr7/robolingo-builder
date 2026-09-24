import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const progressTable = pgTable("progress", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  teacherClassName: text("teacher_class_name").notNull().default(""),
  level: integer("level").notNull(),
  xp: integer("xp").notNull(),
  xpNextLevel: integer("xp_next_level").notNull(),
  coins: integer("coins").notNull(),
  gems: integer("gems").notNull(),
  streakDays: integer("streak_days").notNull(),
  completedMissions: integer("completed_missions").notNull(),
  selectedThemes: text("selected_themes").array().notNull(),
  ownedItems: text("owned_items").array().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProgressSchema = createInsertSchema(progressTable).omit({
  updatedAt: true,
});
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progressTable.$inferSelect;