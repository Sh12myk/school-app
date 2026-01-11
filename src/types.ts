// ---- roles / profile
export type Role = "teacher" | "homeroom" | "admin";

export type UserProfile = {
  uid: string;
  displayName: string;
  teacherId: string;             // ваш внутрішній id (наприклад u1)
  roles: Role[];                 // teacher/homeroom/admin
  homeroomClassId?: string;      // наприклад "7-Б"
};

// ---- lessons
export type Lesson = {
  lessonNumber: number;
  start: string; // "08:30"
  end: string;   // "09:15"
  classId: string;
  subject: string;
  room: string;
  teacherId: string;
};

export type LessonFlag = "replaced" | "room_changed";

export type LessonView = Lesson & {
  cancelled?: boolean;
  flags?: LessonFlag[];
};

// ---- substitutions (discriminated union)
export type Substitution =
  | {
      classId: string;
      lessonNumber: number;
      status: "cancelled";
      room?: never;
      toTeacherId?: never;
      date?: string; // "YYYY-MM-DD"
      createdAt?: number;
      createdBy?: string;
    }
  | {
      classId: string;
      lessonNumber: number;
      status: "room_changed";
      room: string;
      toTeacherId?: never;
      date?: string;
      createdAt?: number;
      createdBy?: string;
    }
  | {
      classId: string;
      lessonNumber: number;
      status: "replaced";
      toTeacherId: string;
      room?: string;
      date?: string;
      createdAt?: number;
      createdBy?: string;
    };

// ---- announcements
export type AnnouncementType = "critical" | "admin" | "meeting" | "survey" | "info";

export type Audience =
  | { kind: "all" }
  | { kind: "teachers" }
  | { kind: "homeroom" }
  | { kind: "class"; classId: string };

export type Announcement = {
  id: string;
  type: AnnouncementType;
  title: string;
  requiresAck?: boolean;
  audience?: Audience;
  createdAt?: number; // ms
  createdBy?: string;
};

// ---- UI helpers
export type DayPhase = "MORNING" | "LESSON_TIME" | "AFTER_SCHOOL";

// ---- teachers (для пікера)
export type Teacher = {
  id: string;      // "u1"
  name: string;    // "Микола"
};
