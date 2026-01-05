import type { Announcement } from "../../types";
import styles from "./ImportantAnnouncementsCard.module.css";

type Props = {
  items: Announcement[];
  isAcked: (id: string) => boolean;
  onAck: (id: string) => void;
  maxItems?: number;
};

function typeLabel(t: Announcement["type"]) {
  switch (t) {
    case "critical":
      return "🚨 Терміново";
    case "admin":
      return "🏫 Адміністрація";
    case "meeting":
      return "👥 Нарада";
    case "survey":
      return "📝 Опитування";
    case "info":
      return "ℹ️ Інфо";
    default:
      return "";
  }
}

export default function ImportantAnnouncementsCard({
  items,
  isAcked,
  onAck,
  maxItems = 2,
}: Props) {
  if (!items || items.length === 0) return null;

  const shown = items.slice(0, maxItems);

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <span aria-hidden>📢</span>
        <span>Важливо</span>
      </div>

      <div className={styles.stack}>
        {shown.map((a) => {
          const acked = isAcked(a.id);
          return (
            <div
              key={a.id}
              className={`${styles.item} ${acked ? styles.itemAcked : ""}`}
            >
              <div className={styles.itemTop}>
                <div>
                  <div className={styles.itemTitle}>{a.title}</div>
                  <div className={styles.meta}>{typeLabel(a.type)}</div>
                </div>

                {a.requiresAck ? (
                  <span className={styles.badge}>{acked ? "✅ Ознайомлено" : "Потрібно ack"}</span>
                ) : (
                  <span className={styles.badge}>Оголошення</span>
                )}
              </div>

              {a.requiresAck && (
                <div className={styles.actions}>
                  {acked ? (
                    <span className={styles.ok}>✅ Ознайомлено</span>
                  ) : (
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onAck(a.id)}>
                      Ознайомився
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
