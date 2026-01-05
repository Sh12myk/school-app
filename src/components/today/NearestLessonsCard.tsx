import type { LessonView } from "../../types";
import styles from "./NearestLessonsCard.module.css";

type Props = {
  items: LessonView[];
  title?: string;
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
        <span key={b} className={styles.badge}>{b}</span>
      ))}
    </div>
  );
}

export default function NearestLessonsCard({
  items,
  title = "Найближчі уроки",
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <span aria-hidden>📌</span>
        <span>{title}</span>
      </div>

      <div className={styles.stack}>
        {items.map((l) => (
          <div key={`${l.classId}-${l.lessonNumber}`} className={styles.item}>
            <div className={styles.top}>
              <div>
                <div className={styles.main}>{l.classId} · {l.subject}</div>
                <div className={styles.time}>{l.start}–{l.end}</div>
              </div>
              <span className={styles.badge}>{l.lessonNumber} урок</span>
            </div>

            <div className={styles.muted}>
              Кабінет: <b className={styles.strongText}>{l.room}</b>
            </div>

            <Flags lesson={l} />
          </div>
        ))}
      </div>
    </div>
  );
}
