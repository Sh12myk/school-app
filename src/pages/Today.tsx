import { useEffect, useMemo, useState } from "react";
import type { Announcement, DayPhase, Lesson, LessonView, Substitution } from "../types";

import styles from "./Today.module.css";

import AttendanceCard from "../components/today/AttendanceCard";
import SummaryCard from "../components/today/SummaryCard";
import NowNextCard from "../components/today/NowNextCard";
import ImportantAnnouncementsCard from "../components/today/ImportantAnnouncementsCard";
import NearestLessonsCard from "../components/today/NearestLessonsCard";

import { useCurrentUser } from "../hooks/useCurrentUser";
import { KEYS } from "../data/keys";
import { SEED_LESSONS, SEED_SUBS } from "../data/seeds";
import { useStoreValue } from "../hooks/useStoreValue";
import { mergeLessonsWithSubs } from "../utils/mergeLessons";

// ---- helpers
function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getDayPhase(now: Date, lessons: { start: string; end: string }[]): DayPhase {
  if (!lessons || lessons.length === 0) return "AFTER_SCHOOL";

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...lessons].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  const firstStart = timeToMinutes(sorted[0].start);
  const lastEnd = timeToMinutes(sorted[sorted.length - 1].end);

  if (nowMin < firstStart) return "MORNING";
  if (nowMin > lastEnd) return "AFTER_SCHOOL";
  return "LESSON_TIME";
}

function getCurrentAndNextLesson<T extends { start: string; end: string }>(now: Date, lessons: T[]) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...lessons].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  const current = sorted.find(
    (l) => timeToMinutes(l.start) <= nowMin && nowMin <= timeToMinutes(l.end)
  );
  const next = sorted.find((l) => timeToMinutes(l.start) > nowMin);

  return { current, next };
}

export default function Today() {
  const { roles, homeroomClassId, teacherId } = useCurrentUser();

  // ---- store data
  const { value: lessons } = useStoreValue<Lesson[]>(KEYS.lessons, SEED_LESSONS);
  const { value: subs } = useStoreValue<Substitution[]>(KEYS.subs, SEED_SUBS);

  // ---- time
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // ---- announcements (поки mock, потім винесемо в store/firebase)
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [ackedAnnouncementIds, setAckedAnnouncementIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const mockAnnouncements: Announcement[] = [
      { id: "a1", type: "meeting", title: "Нарада о 14:30", requiresAck: true },
      { id: "a2", type: "survey", title: "Пройти опитування до кінця дня" },
    ];
    setAnnouncements(mockAnnouncements);
  }, []);

  const isAcked = (id: string) => ackedAnnouncementIds.has(id);

  const onAck = (id: string) => {
    setAckedAnnouncementIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const importantAnnouncements = useMemo(() => {
    const items = announcements.filter((a) =>
      ["critical", "admin", "meeting", "survey"].includes(a.type)
    );
    return items.sort((a, b) => Number(isAcked(a.id)) - Number(isAcked(b.id)));
  }, [announcements, ackedAnnouncementIds]);

  // ---- merged lessons (уроки + заміни)
  const mergedLessons: LessonView[] = useMemo(() => {
    return mergeLessonsWithSubs(lessons, subs);
  }, [lessons, subs]);

  const nearestLessons = useMemo(() => {
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = [...mergedLessons]
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
      .filter((l) => timeToMinutes(l.end) >= nowMin);

    return upcoming.slice(0, 2);
  }, [now, mergedLessons]);

  const { current: currentLesson, next: nextLesson } = useMemo(
    () => getCurrentAndNextLesson(now, mergedLessons),
    [now, mergedLessons]
  );

  const dayPhase: DayPhase = useMemo(() => getDayPhase(now, mergedLessons), [now, mergedLessons]);

  const dateLabel = useMemo(() => {
    return now.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long" });
  }, [now]);

  // ---- attendance
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);

  const showAttendanceBlock = useMemo(() => {
    const isHomeroom = roles.includes("homeroom");
    if (!isHomeroom) return false;
    if (!homeroomClassId) return false;

    const h = now.getHours();
    const m = now.getMinutes();
    const before930 = h < 9 || (h === 9 && m < 30);

    return before930 && !attendanceSubmitted;
  }, [roles, homeroomClassId, now, attendanceSubmitted]);

  // ---- my subs counts (для “Сьогодні”)
  const mySubsCount = useMemo(() => {
    const myKeys = new Set(
      lessons.filter((l) => l.teacherId === teacherId).map((l) => `${l.classId}__${l.lessonNumber}`)
    );
    return subs.filter((s) => myKeys.has(`${s.classId}__${s.lessonNumber}`)).length;
  }, [lessons, subs, teacherId]);

  const myHomeroomSubsCount = useMemo(() => {
    if (!homeroomClassId) return 0;
    return subs.filter((s) => s.classId === homeroomClassId).length;
  }, [subs, homeroomClassId]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Сьогодні</h1>

      {showAttendanceBlock && homeroomClassId && (
        <AttendanceCard
          classId={homeroomClassId}
          deadlineLabel="09:30"
          submitted={attendanceSubmitted}
          onOpenForm={() => alert("Тут буде перехід на Google Form")}
          onMarkSubmitted={() => setAttendanceSubmitted(true)}
        />
      )}

      <SummaryCard
        dateLabel={dateLabel}
        lessonCount={mergedLessons.length}
        substitutionCount={subs.length}
        dayPhase={dayPhase}
      />

      <div className={styles.subline}>
        Мої заміни: <b>{mySubsCount}</b>
        {homeroomClassId ? (
          <>
            {" "}
            · Мого класу: <b>{myHomeroomSubsCount}</b>
          </>
        ) : null}
      </div>

      {(dayPhase === "MORNING" || dayPhase === "LESSON_TIME") && (
        <NowNextCard currentLesson={currentLesson} nextLesson={nextLesson} />
      )}

      {(dayPhase === "MORNING" || dayPhase === "LESSON_TIME") && (
        <NearestLessonsCard items={nearestLessons} />
      )}

      <ImportantAnnouncementsCard
        items={importantAnnouncements}
        isAcked={isAcked}
        onAck={onAck}
        maxItems={2}
      />
    </div>
  );
}
