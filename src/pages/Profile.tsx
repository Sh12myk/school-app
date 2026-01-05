import { useEffect, useMemo, useState } from "react";
import styles from "./Profile.module.css";

type Role = "teacher" | "homeroom" | "admin";

const ROLES_KEY = "schoolapp.user.roles.v1";
const HOMEROOM_KEY = "schoolapp.user.homeroomClassId.v1";
const TEACHER_ID_KEY = "schoolapp.user.teacherId.v1";

const CLASS_LETTERS = ["А", "Б", "В", "Г"] as const;
const CLASSES: string[] = Array.from({ length: 11 }, (_, i) => i + 1).flatMap((g) =>
  CLASS_LETTERS.map((l) => `${g}-${l}`)
);

function loadRoles(): Role[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (!raw) return ["teacher"];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ["teacher"];

    const roles = parsed.filter(
      (x) => x === "teacher" || x === "homeroom" || x === "admin"
    ) as Role[];

    const set = new Set<Role>(roles);
    set.add("teacher"); // teacher завжди
    return Array.from(set);
  } catch {
    return ["teacher"];
  }
}

function saveRoles(roles: Role[]) {
  try {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
  } catch {
    // ignore
  }
}

function loadHomeroomClassId(): string {
  try {
    return localStorage.getItem(HOMEROOM_KEY) || "";
  } catch {
    return "";
  }
}

function saveHomeroomClassId(v: string) {
  try {
    localStorage.setItem(HOMEROOM_KEY, v);
  } catch {
    // ignore
  }
}

function loadTeacherId(): string {
  try {
    return localStorage.getItem(TEACHER_ID_KEY) || "u1";
  } catch {
    return "u1";
  }
}

function saveTeacherId(v: string) {
  try {
    localStorage.setItem(TEACHER_ID_KEY, v);
  } catch {
    // ignore
  }
}

function toggleRole(roles: Role[], role: Role): Role[] {
  const set = new Set<Role>(roles);

  if (role === "teacher") {
    set.add("teacher");
    return Array.from(set);
  }

  if (set.has(role)) set.delete(role);
  else set.add(role);

  set.add("teacher");
  return Array.from(set);
}

export default function Profile() {
  const [roles, setRoles] = useState<Role[]>(() => loadRoles());
  const [homeroomClassId, setHomeroomClassId] = useState<string>(() => loadHomeroomClassId());
  const [teacherId, setTeacherId] = useState<string>(() => loadTeacherId());

  // синхронізація між вкладками
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ROLES_KEY) setRoles(loadRoles());
      if (e.key === HOMEROOM_KEY) setHomeroomClassId(loadHomeroomClassId());
      if (e.key === TEACHER_ID_KEY) setTeacherId(loadTeacherId());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isHomeroom = roles.includes("homeroom");
  const isAdmin = roles.includes("admin");

  const rolesLabel = useMemo(() => {
    const parts: string[] = [];
    parts.push("Вчитель");
    if (isHomeroom) parts.push("Класний керівник");
    if (isAdmin) parts.push("Адміністрація");
    return parts.join("  ");
  }, [isHomeroom, isAdmin]);

  const setRoleAndPersist = (role: Role) => {
    const next = toggleRole(roles, role);
    setRoles(next);
    saveRoles(next);

    // якщо вимкнули homeroom  очищаємо клас
    if (role === "homeroom" && roles.includes("homeroom")) {
      setHomeroomClassId("");
      saveHomeroomClassId("");
    }
  };

  const homeroomSelectDisabled = !isHomeroom;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Профіль</h1>
        <div className={styles.sub}>
          Поточні ролі: <b>{rolesLabel}</b>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Ролі</div>

        <div className={styles.grid}>
          <label className={styles.check}>
            <input type="checkbox" checked readOnly />
            <div>
              <div className={styles.checkLabel}>Вчитель</div>
              <div className={styles.muted}>Базова роль. Уроки/заміни завжди доступні.</div>
            </div>
          </label>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={isHomeroom}
              onChange={() => setRoleAndPersist("homeroom")}
            />
            <div>
              <div className={styles.checkLabel}>Класний керівник</div>
              <div className={styles.muted}>Додає Мій клас та подачу відсутніх.</div>
            </div>
          </label>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setRoleAndPersist("admin")}
            />
            <div>
              <div className={styles.checkLabel}>Адміністрація</div>
              <div className={styles.muted}>Може вносити заміни та оголошення.</div>
            </div>
          </label>
        </div>

        <div className={styles.note}>
          Вчитель може одночасно бути класним керівником і/або адміністрацією  це нормально.
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Мій ID (тимчасово)</div>

        <div className={styles.row}>
          <div>Teacher ID</div>
          <input
            className={styles.select}
            value={teacherId}
            onChange={(e) => {
              const v = e.target.value.trim();
              setTeacherId(v || "u1");
              saveTeacherId(v || "u1");
            }}
            placeholder="Напр.: u1"
          />
        </div>

        <div className={styles.note}>
          Поки без авторизації. Потрібно для фільтру Мої уроки у Замінах.
        </div>
      </div>

      <div className={`${styles.card} ${homeroomSelectDisabled ? styles.disabled : ""}`}>
        <div className={styles.sectionTitle}>Мій клас (для класного керівника)</div>

        <div className={styles.row}>
          <div>Клас</div>
          <select
            className={styles.select}
            value={homeroomClassId}
            onChange={(e) => {
              setHomeroomClassId(e.target.value);
              saveHomeroomClassId(e.target.value);
            }}
            disabled={homeroomSelectDisabled}
          >
            <option value=""> обрати </option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.note}>
          Якщо роль Класний керівник вимкнена  цей блок неактивний.
        </div>
      </div>
    </div>
  );
}