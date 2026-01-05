import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ClassPickerModal.module.css";

type Props = {
  open: boolean;
  title?: string;
  value: string; // "" = всі
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function ClassPickerModal({
  open,
  title = "Вибір класу",
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
    return options.filter((c) => c.toLowerCase().includes(query));
  }, [q, options]);

  const select = (v: string) => {
    onSelect(v);
    onClose();
  };

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
            placeholder="Пошук: 7-Б, 10-А..."
          />

          <div className={styles.list}>
            <button
              className={`${styles.item} ${value === "" ? styles.itemActive : ""}`}
              onClick={() => select("")}
            >
              <span className={styles.itemText}>Всі класи</span>
              {value === "" && <span className={styles.check}>✓</span>}
            </button>

            {filtered.map((c) => {
              const active = c === value;
              return (
                <button
                  key={c}
                  className={`${styles.item} ${active ? styles.itemActive : ""}`}
                  onClick={() => select(c)}
                >
                  <span className={styles.itemText}>{c}</span>
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
