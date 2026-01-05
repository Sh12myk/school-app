import type { AnnouncementItem, Lesson, Substitution, Teacher } from "../types";


export const SEED_TEACHERS: Teacher[] = [
  { id: "u1", name: "Микола" },
  { id: "u2", name: "Ірина" },
  { id: "u3", name: "Олег" },
  { id: "u4", name: "Наталія" },
  { id: "u5", name: "Світлана" },
];

export const SEED_LESSONS: Lesson[] = [
  { lessonNumber: 1, start: "08:30", end: "09:15", classId: "7-Б", subject: "Українська мова", room: "214", teacherId: "u1" },
  { lessonNumber: 2, start: "09:25", end: "10:10", classId: "7-Б", subject: "Математика", room: "215", teacherId: "u2" },
  { lessonNumber: 3, start: "10:20", end: "11:05", classId: "6-А", subject: "Біологія", room: "214", teacherId: "u1" },
  { lessonNumber: 4, start: "11:15", end: "12:00", classId: "8-В", subject: "Біологія", room: "214", teacherId: "u1" },
  { lessonNumber: 5, start: "12:10", end: "12:55", classId: "7-Б", subject: "Географія", room: "110", teacherId: "u3" },
  { lessonNumber: 6, start: "13:05", end: "13:50", classId: "7-Б", subject: "Історія", room: "302", teacherId: "u4" },
];

export const SEED_SUBS: Substitution[] = [
  { lessonNumber: 1, classId: "7-Б", status: "replaced", toTeacherId: "u5" },
  { lessonNumber: 3, classId: "6-А", status: "room_changed", room: "310" },
  { lessonNumber: 6, classId: "9-В", status: "cancelled" },
];

export const SEED_ANNOUNCEMENTS: AnnouncementItem[] = [
  { id: "a1", type: "meeting", title: "Нарада о 14:30", requiresAck: true, audience: { kind: "teachers" } },
  { id: "a2", type: "survey", title: "Пройти опитування до кінця дня", requiresAck: false, audience: { kind: "all" } },
  { id: "a3", type: "admin", title: "Нагадування: подати журнали до 16:00", requiresAck: true, audience: { kind: "teachers" } },
  { id: "a4", type: "critical", title: "Тривога: діяти за алгоритмом укриття", requiresAck: false, audience: { kind: "all" } },
  { id: "a5", type: "info", title: "Класним: подати відсутніх до 09:30", requiresAck: false, audience: { kind: "homeroom" } },
];

