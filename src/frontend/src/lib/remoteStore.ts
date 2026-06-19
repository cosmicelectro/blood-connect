import type { LocalDbState } from "../hooks/useLocalDb";
import { supabase } from "./supabase";

const SHARED_STATE_ID = "main";
const SHARED_STATE_TABLE = "blood_connect_state";

export type SharedStateSnapshot = Pick<
  LocalDbState,
  "users" | "donors" | "shops" | "messages" | "reports"
>;

export interface SharedStateRecord {
  snapshot: SharedStateSnapshot;
  updatedAt: string | null;
}

export function toSharedSnapshot(state: LocalDbState): SharedStateSnapshot {
  return {
    users: state.users,
    donors: state.donors,
    shops: state.shops,
    messages: state.messages,
    reports: state.reports,
  };
}

export async function loadSharedState(): Promise<SharedStateRecord | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SHARED_STATE_TABLE)
    .select("data, updated_at")
    .eq("id", SHARED_STATE_ID)
    .maybeSingle();

  if (error) {
    console.warn("Shared app data could not be loaded", error.message);
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
  if (!supabase) return;

  const { error } = await supabase.from(SHARED_STATE_TABLE).upsert({
    id: SHARED_STATE_ID,
    data: snapshot,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Shared app data could not be saved", error.message);
  }
}
