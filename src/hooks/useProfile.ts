import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import type { Role, UserProfile } from "../types";

function defaultProfile(uid: string): UserProfile {
  return {
    uid,
    displayName: "Користувач",
    teacherId: "u1",
    roles: ["teacher"],
  };
}

export function useProfile(uid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!uid);

  const ref = useMemo(() => {
    if (!uid) return null;
    return doc(db, "users", uid);
  }, [uid]);

  useEffect(() => {
    if (!ref) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          const p = defaultProfile(ref.id);
          await setDoc(ref, { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
          setProfile(p);
          setLoading(false);
          return;
        }

        const data = snap.data() as any;
        const p: UserProfile = {
          uid: ref.id,
          displayName: String(data.displayName ?? "Користувач"),
          teacherId: String(data.teacherId ?? "u1"),
          roles: Array.isArray(data.roles) ? (data.roles as Role[]) : (["teacher"] as Role[]),
          homeroomClassId: data.homeroomClassId ? String(data.homeroomClassId) : undefined,
        };
        setProfile(p);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [ref]);

  async function updateProfile(patch: Partial<UserProfile>) {
    if (!ref) return;
    const safePatch: any = { ...patch, updatedAt: serverTimestamp() };
    // uid не оновлюємо
    delete safePatch.uid;
    await updateDoc(ref, safePatch);
  }

  return { profile, loading, updateProfile };
}
