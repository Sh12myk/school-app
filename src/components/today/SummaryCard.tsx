import type { DayPhase } from "../../types";
import styles from "./SummaryCard.module.css";

type Props = {
  dateLabel: string;
  lessonCount: number;
  substitutionCount: number;
  dayPhase: DayPhase;
};

function phaseLabel(phase: DayPhase) {
  switch (phase) {
    case "MORNING":
      return "🌅 Перед уроками";
    case "LESSON_TIME":
      return "📚 Уроки тривають";
    case "AFTER_SCHOOL":
      return "🌙 Після уроків";
    default:
      return "";
  }
}

export default function SummaryCard({
  dateLabel,
  lessonCount,
  substitutionCount,
  dayPhase,
}: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <span aria-hidden>📅</span>
        <span>{dateLabel}</span>
      </div>

      <div className={styles.metrics}>
        <span className={styles.badge}>
          📚 Уроків: <span className={styles.strong}>{lessonCount}</span>
        </span>

        <span className={styles.badge}>
          🔄 Зміни: <span className={styles.strong}>{substitutionCount}</span>
        </span>

        <span className={styles.badge}>
          {phaseLabel(dayPhase)}
        </span>
      </div>
    </div>
  );
}
