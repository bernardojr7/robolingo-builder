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
  mergeRemoteProgress,
  serializeProgressPayload,
  type SyncablePlayerState,
} from "@workspace/api-client-react/progress-sync";
import { createRequireAuth } from "./middlewares/auth";
import { createProgressRouter } from "./routes/progress";
import { createApp } from "./app";

const testUserId = `clerk-test-${randomUUID()}`;
const testToken = "clerk-test-token";

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
});

describe("progress API authentication and persistence", () => {
  let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
  let baseUrl = "";

  before(async () => {
    await db.delete(progressTable).where(eq(progressTable.userId, testUserId));

    const testVerifier = (async (token: string) => {
      if (token !== testToken) {
        throw new Error("invalid test token");
      }
      return { sub: testUserId };
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
    await db.delete(progressTable).where(eq(progressTable.userId, testUserId));
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
  });

  it("rejects requests without a valid Clerk token", async () => {
    const response = await fetch(`${baseUrl}/progress/me`, {
      headers: { Authorization: "Bearer invalid-token" },
    });

    assert.equal(response.status, 401);
  });
});