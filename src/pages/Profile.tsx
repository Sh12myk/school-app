import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthUser } from "../hooks/useAuthUser";
import { useProfile } from "../hooks/useProfile";
import type { Role } from "../types";

const ROLES: Role[] = ["teacher", "homeroom", "admin"];

export default function Profile() {
  const { user, loading: authLoading } = useAuthUser();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.uid);

  const loading = authLoading || profileLoading;

  if (loading) return <div style={{ padding: 16 }}>Завантаження…</div>;
  if (!user) return <div style={{ padding: 16 }}>Нема доступу</div>;
  if (!profile) return <div style={{ padding: 16 }}>Профіль не знайдено</div>;

  return (
    <div style={{ padding: 16, maxWidth: 640 }}>
      <div style={{ marginBottom: 12 }}>
        ✅ Ви увійшли як <b>{user.displayName ?? user.email ?? user.uid}</b>
      </div>

      <h1>Профіль</h1>

      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Email: <b>{user.email ?? "-"}</b>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          Ім’я:
          <input
            value={profile.displayName}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
          />
        </label>

        <label>
          teacherId:
          <input
            value={profile.teacherId}
            onChange={(e) => updateProfile({ teacherId: e.target.value })}
          />
        </label>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Ролі:</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {ROLES.map((r) => {
              const checked = profile.roles.includes(r);
              return (
                <label key={r} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? Array.from(new Set([...profile.roles, r]))
                        : profile.roles.filter((x) => x !== r);

                      updateProfile({ roles: next });
                    }}
                  />
                  {r}
                </label>
              );
            })}
          </div>
        </div>

        <label>
          Клас (для homeroom):
          <input
            value={profile.homeroomClassId ?? ""}
            onChange={(e) => updateProfile({ homeroomClassId: e.target.value || undefined })}
            placeholder="7-Б"
          />
        </label>

        <button onClick={() => signOut(auth)}>Вийти</button>
      </div>
    </div>
  );
}
