import type { LessonView } from "../../types";
import styles from "./NowNextCard.module.css";

type Props = {
  currentLesson?: LessonView | null;
  nextLesson?: LessonView | null;
};

function Flags({ lesson }: { lesson: LessonView }) {
  const badges: string[] = [];
  if (lesson.cancelled) badges.push("❌ Скасовано");
  if (lesson.flags?.includes("replaced")) badges.push("🔴 Заміна");
  if (lesson.flags?.includes("room_changed")) badges.push("🟡 Кабінет");
  if (badges.length === 0) return null;

  return (
    <div className={styles.flags}>
      {badges.map((b) => (
        <span className={styles.badge} key={b}>{b}</span>
      ))}
    </div>
  );
}

function Section({ label, lesson }: { label: string; lesson?: LessonView | null }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTop}>
        <div>
          <div className={styles.label}>{label}</div>
          {lesson ? <div className={styles.time}>{lesson.start}–{lesson.end}</div> : null}
        </div>
        {lesson ? <span className={styles.badge}>{lesson.lessonNumber} урок</span> : null}
      </div>

      {lesson ? (
        <>
          <div className={styles.main}>{lesson.classId} · {lesson.subject}</div>
          <div className={styles.muted}>Кабінет: <b style={{ color: "var(--text)" }}>{lesson.room}</b></div>
          <Flags lesson={lesson} />
        </>
      ) : (
        <div className={styles.muted}>Зараз перерва або вільний час.</div>
      )}
    </div>
  );
}

export default function NowNextCard({ currentLesson, nextLesson }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <span aria-hidden>⏱️</span>
        <span>Зараз і далі</span>
      </div>

      <div className={styles.stack}>
        <Section label="▶️ Зараз" lesson={currentLesson} />
        <Section label="⏭️ Далі" lesson={nextLesson} />
      </div>
    </div>
  );
}
