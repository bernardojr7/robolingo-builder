import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { eq } from "drizzle-orm";
import { verifyToken } from "@clerk/backend";
import { db, pool, progressTable } from "@workspace/db";
import type { Progress } from "@workspace/api-client-react/progress-sync";
import {
  buildProgressPayload,
  canSyncProgressForAccount,
  getProgressStorageKey,
  isProgressOwnedByAccount,
  mergeRemoteProgress,
  serializeProgressPayload,
  type SyncablePlayerState,
} from "@workspace/api-client-react/progress-sync";
import { createRequireAuth } from "./middlewares/auth";
import { createProgressRouter } from "./routes/progress";
import { createApp } from "./app";

const testUserId = `clerk-test-${randomUUID()}`;
const testToken = "clerk-test-token";
const isolationUsers = {
  teacherOne: `clerk-test-teacher-one-${randomUUID()}`,
  teacherTwo: `clerk-test-teacher-two-${randomUUID()}`,
  studentOne: `clerk-test-student-one-${randomUUID()}`,
  studentTwo: `clerk-test-student-two-${randomUUID()}`,
  nonTeacher: `clerk-test-non-teacher-${randomUUID()}`,
  legacyTeacher: `clerk-test-legacy-teacher-${randomUUID()}`,
};
const isolationTokens = {
  teacherOne: "clerk-test-teacher-one-token",
  teacherTwo: "clerk-test-teacher-two-token",
  studentOne: "clerk-test-student-one-token",
  studentTwo: "clerk-test-student-two-token",
  nonTeacher: "clerk-test-non-teacher-token",
  legacyTeacher: "clerk-test-legacy-teacher-token",
};
const testUsersByToken = new Map<string, string>([
  [testToken, testUserId],
  [isolationTokens.teacherOne, isolationUsers.teacherOne],
  [isolationTokens.teacherTwo, isolationUsers.teacherTwo],
  [isolationTokens.studentOne, isolationUsers.studentOne],
  [isolationTokens.studentTwo, isolationUsers.studentTwo],
  [isolationTokens.nonTeacher, isolationUsers.nonTeacher],
  [isolationTokens.legacyTeacher, isolationUsers.legacyTeacher],
]);
const isolationUserIds = Object.values(isolationUsers);

function makeLocalState(): SyncablePlayerState {
  return {
    name: "Estado local",
    profileOwnerId: testUserId,
    profileRole: "student",
    teacherClassName: "Turma local",
    teacherClassCode: "ROB-LOCAL",
    level: 2,
    xp: 30,
    xpNextLevel: 200,
    coins: 10,
    gems: 1,
    streakDays: 1,
    completedMissions: 2,
    selectedThemes: ["games"],
    ownedItems: ["hair_default"],
  };
}

function makeRemoteProgress(): Progress {
  return {
    userId: testUserId,
    name: "Estado remoto",
    role: "student",
    teacherClassName: "Turma remota",
    teacherClassCode: "ROB-REMOTE",
    level: 8,
    xp: 715,
    xpNextLevel: 900,
    coins: 430,
    gems: 75,
    streakDays: 14,
    completedMissions: 31,
    selectedThemes: ["futebol", "musica", "ciencia"],
    ownedItems: ["hair_default", "jacket_neon"],
    updatedAt: new Date("2026-09-24T00:00:00.000Z").toISOString(),
  };
}

describe("progress synchronization", () => {
  it("restores remote XP, missions, streak, interests and identity after login", () => {
    const localState = makeLocalState();
    const restored = mergeRemoteProgress(localState, makeRemoteProgress(), testUserId);

    assert.equal(restored.profileOwnerId, testUserId);
    assert.equal(restored.name, "Estado remoto");
    assert.equal(restored.level, 8);
    assert.equal(restored.xp, 715);
    assert.equal(restored.xpNextLevel, 900);
    assert.equal(restored.streakDays, 14);
    assert.equal(restored.completedMissions, 31);
    assert.deepEqual(restored.selectedThemes, ["futebol", "musica", "ciencia"]);
    assert.deepEqual(restored.ownedItems, ["hair_default", "jacket_neon"]);
  });

  it("keeps an offline local update available for the first successful reconnection", async () => {
    const restored = mergeRemoteProgress(makeLocalState(), makeRemoteProgress(), testUserId);
    const lastSyncedPayload = serializeProgressPayload(buildProgressPayload(restored));
    const offlineState = {
      ...restored,
      xp: restored.xp + 85,
      completedMissions: restored.completedMissions + 1,
      streakDays: restored.streakDays + 1,
    };
    const offlinePayload = buildProgressPayload(offlineState);
    const serializedOfflinePayload = serializeProgressPayload(offlinePayload);

    assert.notEqual(serializedOfflinePayload, lastSyncedPayload);
    assert.equal(offlinePayload.xp, 800);
    assert.equal(offlinePayload.completedMissions, 32);
    assert.equal(offlinePayload.streakDays, 15);

    let online = false;
    let savedPayload: typeof offlinePayload | null = null;
    const save = async () => {
      if (!online) {
        throw new Error("network unavailable");
      }
      savedPayload = offlinePayload;
    };

    await assert.rejects(save, /network unavailable/);
    assert.equal(savedPayload, null);

    online = true;
    await save();
    assert.deepEqual(savedPayload, offlinePayload);
  });

  it("does not reuse the previous account's local state while the next account hydrates", () => {
    const previousAccount = makeLocalState();
    const nextAccountId = `clerk-test-next-account-${randomUUID()}`;
    const localStorage = new Map([[getProgressStorageKey(testUserId), previousAccount]]);
    const signedOutState = {
      ...previousAccount,
      profileOwnerId: null,
      profileRole: null,
    };

    assert.equal(localStorage.get(getProgressStorageKey(nextAccountId)), undefined);
    assert.equal(isProgressOwnedByAccount(signedOutState, nextAccountId), false);
    assert.equal(
      canSyncProgressForAccount({
        userId: nextAccountId,
        hydratedAccountId: null,
        profileOwnerId: signedOutState.profileOwnerId,
        remoteSyncAllowed: false,
      }),
      false,
    );

    const nextRemote = {
      ...makeRemoteProgress(),
      userId: nextAccountId,
      name: "Nova conta",
      xp: 95,
    };
    const hydrated = mergeRemoteProgress(signedOutState, nextRemote, nextAccountId);

    assert.equal(hydrated.profileOwnerId, nextAccountId);
    assert.equal(hydrated.name, "Nova conta");
    assert.equal(hydrated.xp, 95);
    assert.notEqual(hydrated.xp, previousAccount.xp);
  });

  it("does not send cached progress when the new account's remote load fails", () => {
    assert.equal(
      canSyncProgressForAccount({
        userId: "clerk-test-next-account",
        hydratedAccountId: "clerk-test-next-account",
        profileOwnerId: "clerk-test-next-account",
        remoteSyncAllowed: false,
      }),
      false,
    );
  });
});

describe("progress API authentication and persistence", () => {
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl = "";

  before(async () => {
    for (const userId of [testUserId, ...isolationUserIds]) {
      await db.delete(progressTable).where(eq(progressTable.userId, userId));
    }

    const testVerifier = (async (token: string) => {
      const userId = testUsersByToken.get(token);
      if (!userId) {
        throw new Error("invalid test token");
      }
      return { sub: userId };
    }) as unknown as typeof verifyToken;

    const app = createApp(createProgressRouter(createRequireAuth(testVerifier)));
    server = app.listen(0);
    await new Promise<void>((resolve) => {
      server.once("listening", resolve);
    });
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}/api`;
  });

  after(async () => {
    for (const userId of [testUserId, ...isolationUserIds]) {
      await db.delete(progressTable).where(eq(progressTable.userId, userId));
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await pool.end();
  });

  it("accepts a Clerk test token for PUT and returns the saved progress on GET", async () => {
    const payload = {
      name: "Aluno sincronizado",
      role: "teacher",
      teacherClassName: "6º Ano",
      teacherClassCode: "",
      level: 6,
      xp: 560,
      xpNextLevel: 800,
      coins: 220,
      gems: 40,
      streakDays: 9,
      completedMissions: 18,
      selectedThemes: ["games", "ciencia"],
      ownedItems: ["hair_default", "jacket_neon"],
    };
    const headers = {
      Authorization: `Bearer ${testToken}`,
      "Content-Type": "application/json",
    };

    const putResponse = await fetch(`${baseUrl}/progress/me`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    assert.equal(putResponse.status, 200);
    const saved = (await putResponse.json()) as Record<string, unknown>;
    assert.equal(saved.userId, testUserId);
    assert.equal(saved.xp, 560);
    assert.equal(saved.completedMissions, 18);
    assert.equal(saved.streakDays, 9);
    assert.deepEqual(saved.selectedThemes, ["games", "ciencia"]);
    assert.match(String(saved.teacherClassCode), /^ROB-/);
    assert.ok(Date.parse(String(saved.updatedAt)));

    const getResponse = await fetch(`${baseUrl}/progress/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    assert.equal(getResponse.status, 200);
    const restored = (await getResponse.json()) as Record<string, unknown>;
    assert.equal(restored.name, "Aluno sincronizado");
    assert.equal(restored.xp, 560);
    assert.equal(restored.completedMissions, 18);
    assert.equal(restored.streakDays, 9);
    assert.deepEqual(restored.selectedThemes, ["games", "ciencia"]);
    assert.equal(restored.updatedAt, saved.updatedAt);
  });

  it("rejects a stale concurrent write instead of overwriting newer progress", async () => {
    const headers = {
      Authorization: `Bearer ${testToken}`,
      "Content-Type": "application/json",
    };
    const initialResponse = await fetch(`${baseUrl}/progress/me`, { headers });
    assert.equal(initialResponse.status, 200);
    const initial = (await initialResponse.json()) as Record<string, unknown>;
    const basePayload = {
      name: String(initial.name),
      role: initial.role,
      teacherClassName: String(initial.teacherClassName),
      teacherClassCode: String(initial.teacherClassCode),
      level: Number(initial.level),
      xp: Number(initial.xp),
      xpNextLevel: Number(initial.xpNextLevel),
      coins: Number(initial.coins),
      gems: Number(initial.gems),
      streakDays: Number(initial.streakDays),
      completedMissions: Number(initial.completedMissions),
      selectedThemes: initial.selectedThemes,
      ownedItems: initial.ownedItems,
      updatedAt: String(initial.updatedAt),
    };
    const firstWrite = {
      ...basePayload,
      xp: 700,
      completedMissions: 20,
    };
    const secondWrite = {
      ...basePayload,
      xp: 850,
      completedMissions: 21,
    };

    const responses = await Promise.all([
      fetch(`${baseUrl}/progress/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(firstWrite),
      }),
      fetch(`${baseUrl}/progress/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(secondWrite),
      }),
    ]);

    assert.deepEqual(
      responses.map((response) => response.status).sort((a, b) => a - b),
      [200, 409],
    );

    const finalResponse = await fetch(`${baseUrl}/progress/me`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const final = (await finalResponse.json()) as Record<string, unknown>;
    assert.ok(
      (final.xp === firstWrite.xp && final.completedMissions === firstWrite.completedMissions) ||
        (final.xp === secondWrite.xp && final.completedMissions === secondWrite.completedMissions),
    );
  });

  it("rejects requests without a valid Clerk token", async () => {
    const response = await fetch(`${baseUrl}/progress/me`, {
      headers: { Authorization: "Bearer invalid-token" },
    });

    assert.equal(response.status, 401);
  });

  it("keeps each teacher's student list isolated by class code", async () => {
    const teacherPayload = (name: string) => ({
      name,
      role: "teacher" as const,
      teacherClassName: name,
      teacherClassCode: "",
      level: 1,
      xp: 0,
      xpNextLevel: 100,
      coins: 0,
      gems: 0,
      streakDays: 0,
      completedMissions: 0,
      selectedThemes: [],
      ownedItems: [],
    });
    const studentPayload = (
      name: string,
      teacherClassCode: string,
    ) => ({
      ...teacherPayload(name),
      role: "student" as const,
      teacherClassCode,
    });
    const putProgress = async (token: string, payload: object) =>
      fetch(`${baseUrl}/progress/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    const getStudents = (token: string) =>
      fetch(`${baseUrl}/progress/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

    const teacherOneResponse = await putProgress(
      isolationTokens.teacherOne,
      teacherPayload("Professor 1"),
    );
    const teacherTwoResponse = await putProgress(
      isolationTokens.teacherTwo,
      teacherPayload("Professor 2"),
    );
    assert.equal(teacherOneResponse.status, 200);
    assert.equal(teacherTwoResponse.status, 200);

    const teacherOne = (await teacherOneResponse.json()) as {
      teacherClassCode: string;
    };
    const teacherTwo = (await teacherTwoResponse.json()) as {
      teacherClassCode: string;
    };
    assert.match(teacherOne.teacherClassCode, /^ROB-/);
    assert.match(teacherTwo.teacherClassCode, /^ROB-/);
    assert.notEqual(teacherOne.teacherClassCode, teacherTwo.teacherClassCode);

    const studentOneResponse = await putProgress(
      isolationTokens.studentOne,
      studentPayload("Aluno 1", teacherOne.teacherClassCode),
    );
    const studentTwoResponse = await putProgress(
      isolationTokens.studentTwo,
      studentPayload("Aluno 2", teacherTwo.teacherClassCode),
    );
    assert.equal(studentOneResponse.status, 200);
    assert.equal(studentTwoResponse.status, 200);

    const teacherOneStudentsResponse = await getStudents(isolationTokens.teacherOne);
    const teacherTwoStudentsResponse = await getStudents(isolationTokens.teacherTwo);
    assert.equal(teacherOneStudentsResponse.status, 200);
    assert.equal(teacherTwoStudentsResponse.status, 200);

    const teacherOneStudents = (await teacherOneStudentsResponse.json()) as Array<{
      userId: string;
      name: string;
      teacherClassCode: string;
    }>;
    const teacherTwoStudents = (await teacherTwoStudentsResponse.json()) as Array<{
      userId: string;
      name: string;
      teacherClassCode: string;
    }>;
    assert.deepEqual(teacherOneStudents.map(({ name }) => name), ["Aluno 1"]);
    assert.deepEqual(teacherTwoStudents.map(({ name }) => name), ["Aluno 2"]);
    assert.equal(teacherOneStudents[0]?.userId, isolationUsers.studentOne);
    assert.equal(teacherTwoStudents[0]?.userId, isolationUsers.studentTwo);
    assert.equal(teacherOneStudents[0]?.teacherClassCode, teacherOne.teacherClassCode);
    assert.equal(teacherTwoStudents[0]?.teacherClassCode, teacherTwo.teacherClassCode);
  });

  it("rejects invalid class codes and non-teacher access to student lists", async () => {
    await db.insert(progressTable).values({
      userId: isolationUsers.nonTeacher,
      name: "Aluno sem acesso de professor",
      role: "student",
      teacherClassName: "Turma de teste",
      teacherClassCode: "ROB-TEST",
      level: 1,
      xp: 0,
      xpNextLevel: 100,
      coins: 0,
      gems: 0,
      streakDays: 0,
      completedMissions: 0,
      selectedThemes: [],
      ownedItems: [],
    });

    const invalidStudentResponse = await fetch(`${baseUrl}/progress/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${isolationTokens.nonTeacher}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Aluno com código inválido",
        role: "student",
        teacherClassName: "Turma inexistente",
        teacherClassCode: "ROB-NOT-FOUND",
        level: 1,
        xp: 0,
        xpNextLevel: 100,
        coins: 0,
        gems: 0,
        streakDays: 0,
        completedMissions: 0,
        selectedThemes: [],
        ownedItems: [],
      }),
    });
    assert.equal(invalidStudentResponse.status, 400);
    assert.deepEqual(await invalidStudentResponse.json(), { error: "Invalid class code" });

    const studentListResponse = await fetch(`${baseUrl}/progress/students`, {
      headers: { Authorization: `Bearer ${isolationTokens.nonTeacher}` },
    });
    assert.equal(studentListResponse.status, 403);
    assert.deepEqual(await studentListResponse.json(), { error: "Teacher access required" });
  });

  it("returns no students for a legacy teacher without a class code", async () => {
    await db.insert(progressTable).values({
      userId: isolationUsers.legacyTeacher,
      name: "Professor antigo",
      role: "teacher",
      teacherClassName: "Turma antiga",
      teacherClassCode: "",
      level: 1,
      xp: 0,
      xpNextLevel: 100,
      coins: 0,
      gems: 0,
      streakDays: 0,
      completedMissions: 0,
      selectedThemes: [],
      ownedItems: [],
    });

    const response = await fetch(`${baseUrl}/progress/students`, {
      headers: { Authorization: `Bearer ${isolationTokens.legacyTeacher}` },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });
});
