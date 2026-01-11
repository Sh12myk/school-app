import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

export function useCurrentUser() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.uid);

  const loading = authLoading || profileLoading;

  return {
    loading,
    isAuthed: !!user,
    uid: user?.uid ?? null,
    email: user?.email ?? null,

    // profile fields (null-safe)
    teacherId: profile?.teacherId ?? "u1",
    roles: profile?.roles ?? ["teacher"],
    homeroomClassId: profile?.homeroomClassId ?? "",

    profile,
  };
}
