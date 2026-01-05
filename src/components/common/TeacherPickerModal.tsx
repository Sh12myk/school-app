import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TeacherPickerModal.module.css";
import type { Teacher } from "../../types";



type Props = {
  open: boolean;
  title?: string;
  value: string; // teacherId
  options: Teacher[];
  onSelect: (teacherId: string) => void;
  onClose: () => void;
};

export default function TeacherPickerModal({
  open,
  title = "Вибір вчителя",
  value,
  options,
  onSelect,
  onClose,
}: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return options;

    return options.filter((t) => {
      const hay = `${t.name} ${t.id}`.toLowerCase();
      return hay.includes(query);
    });
  }, [q, options]);

  const select = (id: string) => {
    onSelect(id);
    onClose();
  };

  const currentName = useMemo(() => {
    const hit = options.find((t) => t.id === value);
    return hit?.name ?? "";
  }, [options, value]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.head}>
          <div className={styles.title}>{title}</div>
          <button className={styles.close} onClick={onClose}>
            Закрити
          </button>
        </div>

        <div className={styles.body}>
          <input
            ref={inputRef}
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук: прізвище або id..."
          />

          {value && (
            <div className={styles.current}>
              Обрано: <b>{currentName || value}</b>
            </div>
          )}

          <div className={styles.list}>
            {filtered.map((t) => {
              const active = t.id === value;
              return (
                <button
                  key={t.id}
                  className={`${styles.item} ${active ? styles.itemActive : ""}`}
                  onClick={() => select(t.id)}
                >
                  <div className={styles.itemMain}>
                    <div className={styles.itemName}>{t.name}</div>
                    <div className={styles.itemMeta}>id: {t.id}</div>
                  </div>
                  {active && <span className={styles.check}>✓</span>}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className={styles.empty}>Нічого не знайдено.</div>
            )}
          </div>
        </div>
      </div>

      <button className={styles.backdropClick} onClick={onClose} aria-label="Close" />
    </div>
  );
}
