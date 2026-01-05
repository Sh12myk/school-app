import styles from "./AttendanceCard.module.css";

type Props = {
  classId: string;
  deadlineLabel: string; // "09:30"
  submitted: boolean;
  onOpenForm: () => void;
  onMarkSubmitted: () => void;
};

export default function AttendanceCard({
  classId,
  deadlineLabel,
  submitted,
  onOpenForm,
  onMarkSubmitted,
}: Props) {
  return (
    <section className={styles.card} aria-label="Подача відсутніх">
      <div className={styles.head}>
        <div className={styles.titleRow}>
          <span className={styles.icon} aria-hidden="true">⏰</span>
          <div>
            <div className={styles.title}>Подати відсутніх</div>
            <div className={styles.subtitle}>до {deadlineLabel}</div>
          </div>
        </div>

        {submitted ? <span className={styles.badge}>✅ Подано</span> : null}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.meta}>
          <span className={styles.metaKey}>Дедлайн:</span> {deadlineLabel}
        </div>

        <div className={styles.meta}>
          <span className={styles.metaKey}>Клас:</span> {classId}
        </div>

        <button type="button" className={styles.linkBtn} onClick={onOpenForm}>
          Google Form
        </button>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onOpenForm}
          disabled={submitted}
        >
          Подати ({classId})
        </button>

        {!submitted ? (
          <button type="button" className={styles.btn} onClick={onMarkSubmitted}>
            Я вже подав
          </button>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.btnDisabled}`} disabled>
            Я вже подав
          </button>
        )}
      </div>
    </section>
  );
}
