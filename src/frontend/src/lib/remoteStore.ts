import type { LocalDbState } from "../hooks/useLocalDb";
import { supabase } from "./supabase";

const SHARED_STATE_ID = "main";
const SHARED_STATE_TABLE = "blood_connect_state";
let lastSharedStateError: string | null = null;

export type SharedStateSnapshot = Pick<
  LocalDbState,
  | "users"
  | "donors"
  | "shops"
  | "messages"
  | "reports"
  | "bloodRequests"
  | "auditLogs"
>;

export interface SharedStateRecord {
  snapshot: SharedStateSnapshot;
  updatedAt: string | null;
}

function describeSharedStateError(message: string) {
  if (
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("blood_connect_state")
  ) {
    return `${message}. Run supabase-shared-state.sql in Supabase SQL Editor, then redeploy the frontend.`;
  }

  if (
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("policy")
  ) {
    return `${message}. Check the anon read/insert/update policies in supabase-shared-state.sql.`;
  }

  return message;
}

export function toSharedSnapshot(state: LocalDbState): SharedStateSnapshot {
  return {
    users: state.users,
    donors: state.donors,
    shops: state.shops,
    messages: state.messages,
    reports: state.reports,
    bloodRequests: state.bloodRequests,
    auditLogs: state.auditLogs,
  };
}

export function getLastSharedStateError() {
  return lastSharedStateError;
}

export async function loadSharedState(): Promise<SharedStateRecord | null> {
  lastSharedStateError = null;
  if (!supabase) {
    lastSharedStateError = "Supabase is not configured.";
    return null;
  }

  const { data, error } = await supabase
    .from(SHARED_STATE_TABLE)
    .select("data, updated_at")
    .eq("id", SHARED_STATE_ID)
    .maybeSingle();

  if (error) {
    lastSharedStateError = describeSharedStateError(error.message);
    console.warn("Shared app data could not be loaded", lastSharedStateError);
    return null;
  }

  const snapshot = data?.data as SharedStateSnapshot | undefined;
  if (!snapshot) return null;

  return {
    snapshot,
    updatedAt: data?.updated_at || null,
  };
}

export async function saveSharedState(snapshot: SharedStateSnapshot) {
  lastSharedStateError = null;
  if (!supabase) {
    lastSharedStateError = "Supabase is not configured.";
    return false;
  }

  const { error } = await supabase.from(SHARED_STATE_TABLE).upsert({
    id: SHARED_STATE_ID,
    data: snapshot,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    lastSharedStateError = describeSharedStateError(error.message);
    console.warn("Shared app data could not be saved", lastSharedStateError);
    return false;
  }

  return true;
}
