import { useEffect, useState } from "react";

export type Role = "teacher" | "homeroom" | "admin";

export type CurrentUser = {
  roles: Role[];
  homeroomClassId: string;
  teacherId: string; // тимчасово: для "Мої уроки"
};

export const ROLES_KEY = "schoolapp.user.roles.v1";
export const HOMEROOM_KEY = "schoolapp.user.homeroomClassId.v1";
export const TEACHER_ID_KEY = "schoolapp.user.teacherId.v1";

function safeParseRoles(raw: string | null): Role[] {
  if (!raw) return ["teacher"];
  try {
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

function readCurrentUser(): CurrentUser {
  let roles: Role[] = ["teacher"];
  let homeroomClassId = "";
  let teacherId = "u1"; // дефолт для моків (можеш змінити в профілі)

  try {
    roles = safeParseRoles(localStorage.getItem(ROLES_KEY));
    homeroomClassId = localStorage.getItem(HOMEROOM_KEY) || "";
    teacherId = localStorage.getItem(TEACHER_ID_KEY) || teacherId;
  } catch {
    // ignore
  }

  return { roles, homeroomClassId, teacherId };
}

function listenStorage(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === ROLES_KEY || e.key === HOMEROOM_KEY || e.key === TEACHER_ID_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(() => readCurrentUser());

  useEffect(() => {
    const update = () => setUser(readCurrentUser());
    const unsub = listenStorage(update);

    // в цій же вкладці storage не стріляє — тимчасово poll
    const t = setInterval(update, 1000);

    return () => {
      unsub();
      clearInterval(t);
    };
  }, []);

  return user;
}