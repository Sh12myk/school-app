import { useMemo, useState } from "react";
import type { AnnouncementItem, Audience, Announcement } from "../types";
import styles from "./Announcements.module.css";
import CreateAnnouncementModal from "../components/announcements/CreateAnnouncementModal";
import { useCurrentUser } from "../hooks/useCurrentUser";

import { KEYS } from "../data/keys";
import { SEED_ANNOUNCEMENTS } from "../data/seeds";
import { useStoreValue } from "../hooks/useStoreValue";

type Filter = "all" | Announcement["type"];
type ReadFilter = "all" | "unacked" | "acked";

function typeLabel(t: Announcement["type"]) {
  switch (t) {
    case "critical": return "🚨 Терміново";
    case "admin": return "🏫 Адміністрація";
    case "meeting": return "👥 Нарада";
    case "survey": return "📝 Опитування";
    case "info": return "ℹ️ Інфо";
    default: return String(t);
  }
}

function passesAudience(aud: Audience | undefined, roles: string[], homeroomClassId: string) {
  if (!aud) return true;
  if (aud.kind === "all") return true;
  if (aud.kind === "teachers") return true;
  if (aud.kind === "homeroom") return roles.includes("homeroom");
  if (aud.kind === "class") return !!homeroomClassId && homeroomClassId === aud.classId;
  return true;
}

export default function Announcements() {
  const { roles, homeroomClassId } = useCurrentUser();

  // store-backed state
  const { value: items, setValue: setItems } = useStoreValue<AnnouncementItem[]>(
    KEYS.announcements,
    SEED_ANNOUNCEMENTS
  );

  const { value: ackedArr, setValue: setAckedArr } = useStoreValue<string[]>(
    KEYS.announcementsAck,
    []
  );

  // UI state
  const [typeFilter, setTypeFilter] = useState<Filter>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [openCreate, setOpenCreate] = useState(false);

  const isAdmin = roles.includes("admin");

  const ackedSet = useMemo(() => new Set(ackedArr), [ackedArr]);

  const onAck = (id: string) => {
    setAckedArr((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const onCreate = (a: AnnouncementItem) => {
    setItems((prev) => [a, ...prev]);
  };

  const visibleItems = useMemo(() => {
    return items.filter((x) => passesAudience(x.audience, roles, homeroomClassId));
  }, [items, roles, homeroomClassId]);

  const filtered = useMemo(() => {
    let arr = [...visibleItems];

    if (typeFilter !== "all") arr = arr.filter((a) => a.type === typeFilter);

    if (readFilter === "acked") arr = arr.filter((a) => ackedSet.has(a.id));
    if (readFilter === "unacked") arr = arr.filter((a) => !ackedSet.has(a.id));

    // спочатку непрочитані, потім прочитані
    arr.sort((a, b) => Number(ackedSet.has(a.id)) - Number(ackedSet.has(b.id)));
    return arr;
  }, [visibleItems, typeFilter, readFilter, ackedSet]);

  const total = visibleItems.length;
  const unacked = visibleItems.filter((a) => !ackedSet.has(a.id)).length;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Оголошення</h1>
          <div className={styles.sub}>
            Видимі: <b>{total}</b> · Непрочитані: <b>{unacked}</b>
          </div>
        </div>

        <div className={styles.actionsTop}>
          {isAdmin && (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setOpenCreate(true)}
            >
              + Створити
            </button>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        {(["all", "critical", "admin", "meeting", "survey", "info"] as Filter[]).map((f) => (
          <button
            key={f}
            className={f === typeFilter ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => setTypeFilter(f)}
          >
            {f === "all" ? "🗂️ Всі" : typeLabel(f)}
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        {(["all", "unacked", "acked"] as ReadFilter[]).map((f) => (
          <button
            key={f}
            className={f === readFilter ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => setReadFilter(f)}
          >
            {f === "all" ? "Усі" : f === "unacked" ? "Непрочитані" : "Прочитані"}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map((a) => {
          const acked = ackedSet.has(a.id);

          return (
            <div key={a.id} className={acked ? `${styles.card} ${styles.dim}` : styles.card}>
              <div className={styles.top}>
                <div>
                  <div className={styles.h}>{a.title}</div>
                  <div className={styles.meta}>{typeLabel(a.type)}</div>
                </div>

                <span className={styles.badge}>
                  {a.requiresAck ? (acked ? "✅ Ознайомлено" : "Потрібно ack") : "Оголошення"}
                </span>
              </div>

              {a.requiresAck && (
                <div className={styles.actions}>
                  {acked ? (
                    <span className={styles.badge}>✅ Ознайомлено</span>
                  ) : (
                    <button className={styles.btn} onClick={() => onAck(a.id)}>
                      Ознайомився
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateAnnouncementModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={onCreate}
      />
    </div>
  );
}
