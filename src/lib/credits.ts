import fs from "fs";
import path from "path";
import { DATA_DIR, ensureDirs } from "./storage";
import type { Plan } from "./types";

export const PLAN_CREDITS: Record<Plan, number> = { free: 1, basic: 30, pro: 100, premium: 300 };

type Account = { credits: number; plan: Plan };
type Db = Record<string, Account>;

const FILE = path.join(DATA_DIR, "credits.json");

function load(): Db {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}
function save(db: Db) {
  ensureDirs();
  fs.writeFileSync(FILE, JSON.stringify(db));
}

const validId = (id: string) => /^[a-zA-Z0-9-]{8,64}$/.test(id);

export function getAccount(clientId: string): Account {
  if (!validId(clientId)) throw new Error("Invalid client id");
  const db = load();
  if (!db[clientId]) {
    db[clientId] = { credits: PLAN_CREDITS.free, plan: "free" };
    save(db);
  }
  return db[clientId];
}

/** Consume one generation (3 videos). Returns false if no credits. */
export function consume(clientId: string): boolean {
  const db = load();
  const acc = db[clientId] ?? getAccount(clientId);
  if (acc.credits < 1) return false;
  acc.credits -= 1;
  db[clientId] = acc;
  save(db);
  return true;
}

export function refund(clientId: string) {
  const db = load();
  if (db[clientId]) {
    db[clientId].credits += 1;
    save(db);
  }
}

export function addPlan(clientId: string, plan: Plan) {
  const db = load();
  const acc = db[clientId] ?? { credits: 0, plan: "free" as Plan };
  acc.credits += PLAN_CREDITS[plan];
  acc.plan = plan;
  db[clientId] = acc;
  save(db);
}
