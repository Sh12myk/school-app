export type Role = "teacher" | "homeroom_teacher" | "admin";

export type User = {
  id: string;
  name: string;
  role: Role;
  homeroomClassId?: string;
};

export type Lesson = {
  lessonNumber: number;
  start: string;
  end: string;
  classId: string;
  subject: string;
  room: string;
  teacherId: string;
};

export type Substitution =
  | { lessonNumber: number; classId: string; status: "room_changed"; room: string }
  | { lessonNumber: number; classId: string; status: "replaced"; toTeacherId: string; room?: string }
  | { lessonNumber: number; classId: string; status: "cancelled" };

export type Announcement = {
  id: string;
  type: "critical" | "admin" | "meeting" | "survey" | "info";
  title: string;
  requiresAck?: boolean;
};

export type DayPhase = "MORNING" | "LESSON_TIME" | "AFTER_SCHOOL";

export type LessonView = Lesson & {
  flags?: ("replaced" | "room_changed")[];
  cancelled?: boolean;
};
export type Teacher = {
  id: string;
  name: string;
};
export type Audience =
  | { kind: "all" }
  | { kind: "teachers" }
  | { kind: "homeroom" }
  | { kind: "class"; classId: string };

export type AnnouncementItem = Announcement & { audience?: Audience };
