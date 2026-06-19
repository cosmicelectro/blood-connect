import type { LocalDbState } from "../hooks/useLocalDb";
import { supabase } from "./supabase";

const SHARED_STATE_ID = "main";
const SHARED_STATE_TABLE = "blood_connect_state";

export type SharedStateSnapshot = Pick<
  LocalDbState,
  "users" | "donors" | "shops" | "messages" | "reports"
>;

export function toSharedSnapshot(state: LocalDbState): SharedStateSnapshot {
  return {
    users: state.users,
    donors: state.donors,
    shops: state.shops,
    messages: state.messages,
    reports: state.reports,
  };
}

export async function loadSharedState(): Promise<SharedStateSnapshot | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SHARED_STATE_TABLE)
    .select("data")
    .eq("id", SHARED_STATE_ID)
    .maybeSingle();

  if (error) {
    console.warn("Shared app data could not be loaded", error.message);
    return null;
  }

  return (data?.data as SharedStateSnapshot | undefined) || null;
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
