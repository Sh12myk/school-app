import type { Lesson, LessonView, Substitution } from "../types";

export function mergeLessonsWithSubs(lessons: Lesson[], subs: Substitution[]): LessonView[] {
  return lessons.map((l) => {
    const s = subs.find((x) => x.lessonNumber === l.lessonNumber && x.classId === l.classId);
    if (!s) return { ...l, flags: [] };

    if (s.status === "cancelled") return { ...l, cancelled: true, flags: [] };

    if (s.status === "room_changed") {
      return { ...l, room: s.room ?? l.room, flags: ["room_changed"] };
    }

    if (s.status === "replaced") {
      return {
        ...l,
        teacherId: s.toTeacherId,
        room: s.room ?? l.room,
        flags: ["replaced"],
      };
    }

    return { ...l, flags: [] };
  });
}
