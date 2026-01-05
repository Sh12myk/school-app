export type Role = "teacher" | "homeroom" | "admin";

const ROLES_KEY = "schoolapp.user.roles.v1";
const HOMEROOM_KEY = "schoolapp.user.homeroomClassId.v1";
const TEACHER_ID_KEY = "schoolapp.user.teacherId.v1";

export function readRoles(): Role[] {
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (!raw) return ["teacher"];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ["teacher"];
    const roles = parsed.filter((x) => x === "teacher" || x === "homeroom" || x === "admin") as Role[];
    const set = new Set<Role>(roles);
    set.add("teacher");
    return Array.from(set);
  } catch {
    return ["teacher"];
  }
}

export function readTeacherId(): string {
  try {
    return localStorage.getItem(TEACHER_ID_KEY) || "u1";
  } catch {
    return "u1";
  }
}

export function readHomeroomClassId(): string {
  try {
    return localStorage.getItem(HOMEROOM_KEY) || "";
  } catch {
    return "";
  }
}

// щоб сторінки бачили зміни без перезавантаження  диспатчимо подію
export function writeRoles(next: Role[]) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("schoolapp:profile"));
}
export function writeTeacherId(v: string) {
  localStorage.setItem(TEACHER_ID_KEY, v);
  window.dispatchEvent(new Event("schoolapp:profile"));
}
export function writeHomeroomClassId(v: string) {
  localStorage.setItem(HOMEROOM_KEY, v);
  window.dispatchEvent(new Event("schoolapp:profile"));
}