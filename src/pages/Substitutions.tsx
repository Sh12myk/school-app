import { useEffect, useMemo, useState } from "react";
import type { Lesson, Substitution, Teacher } from "../types";
import styles from "./Substitutions.module.css";
import { useCurrentUser } from "../hooks/useCurrentUser";
import CreateSubstitutionModal from "../components/substitutions/CreateSubstitutionModal";
import ClassPickerModal from "../components/common/ClassPickerModal";

import { KEYS } from "../data/keys";
import { SEED_LESSONS, SEED_SUBS, SEED_TEACHERS } from "../data/seeds";
import { useStoreValue } from "../hooks/useStoreValue";

type Tab = "myLessons" | "myHomeroom" | "manage";

const CLASS_LETTERS = ["А", "Б", "В", "Г"] as const;
const CLASSES: string[] = Array.from({ length: 11 }, (_, i) => i + 1).flatMap((g) =>
  CLASS_LETTERS.map((l) => `${g}-${l}`)
);

function tabLabel(t: Tab) {
  if (t === "myLessons") return "Мої уроки";
  if (t === "myHomeroom") return "Мій клас";
  return "Керування";
}

function badgeLabel(s: Substitution) {
  if (s.status === "cancelled") return "Скасовано";
  if (s.status === "room_changed") return `Кабінет: ${s.room ?? "?"}`;
  return `Заміна: ${s.toTeacherId ?? "?"}${s.room ? ` · каб. ${s.room}` : ""}`;
}

export default function Substitutions() {
  const { roles, homeroomClassId, teacherId } = useCurrentUser();

  // ✅ store-backed data (hooks ТІЛЬКИ всередині компонента)
  const { value: subs, setValue: setSubs } = useStoreValue<Substitution[]>(KEYS.subs, SEED_SUBS);
  const { value: lessons } = useStoreValue<Lesson[]>(KEYS.lessons, SEED_LESSONS);
  const { value: teachers } = useStoreValue<Teacher[]>(KEYS.teachers, SEED_TEACHERS);
  const { value: tab, setValue: setTab } = useStoreValue<Tab>(KEYS.subsTab, "myLessons");

  const isHomeroom = roles.includes("homeroom") && !!homeroomClassId;
  const isAdmin = roles.includes("admin");

  const availableTabs: Tab[] = useMemo(() => {
    const arr: Tab[] = ["myLessons"];
    if (isHomeroom) arr.push("myHomeroom");
    if (isAdmin) arr.push("manage");
    return arr;
  }, [isHomeroom, isAdmin]);

  // якщо вкладка стала недоступною (роль прибрали) → падаємо на "Мої уроки"
  useEffect(() => {
    if (!availableTabs.includes(tab)) setTab("myLessons");
  }, [availableTabs, tab, setTab]);

  const [openCreate, setOpenCreate] = useState(false);
  const [classFilter, setClassFilter] = useState<string>("");
  const [openClassPicker, setOpenClassPicker] = useState(false);

  // ключі моїх уроків
  const myLessonKeys = useMemo(() => {
    const mine = lessons.filter((l) => l.teacherId === teacherId);
    return new Set(mine.map((l) => `${l.classId}__${l.lessonNumber}`));
  }, [lessons, teacherId]);

  const filteredSubs = useMemo(() => {
    let arr = [...subs];

    if (tab === "myLessons") {
      arr = arr.filter((s) => myLessonKeys.has(`${s.classId}__${s.lessonNumber}`));
    } else if (tab === "myHomeroom") {
      arr = arr.filter((s) => s.classId === homeroomClassId);
    } else {
      if (classFilter) arr = arr.filter((s) => s.classId === classFilter);
    }

    arr.sort(
      (a, b) =>
        a.lessonNumber - b.lessonNumber ||
        a.classId.localeCompare(b.classId, "uk-UA")
    );

    return arr;
  }, [subs, tab, myLessonKeys, homeroomClassId, classFilter]);

  const onCreate = (s: Substitution) => {
    setSubs((prev) => [s, ...prev]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Заміни</h1>
          <div className={styles.sub}>
            teacherId: <b>{teacherId}</b>
            {isHomeroom ? (
              <>
                {" "}
                · мій клас: <b>{homeroomClassId}</b>
              </>
            ) : null}
          </div>
        </div>

        {isAdmin && (
          <button className={styles.primaryBtn} onClick={() => setOpenCreate(true)}>
            Внести заміну
          </button>
        )}
      </div>

      <div className={styles.controls}>
        {availableTabs.map((t) => (
          <button
            key={t}
            className={`${styles.chip} ${t === tab ? styles.chipActive : ""}`}
            onClick={() => setTab(t)}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {tab === "manage" && (
        <div className={styles.controls}>
          <span className={styles.label}>Клас:</span>

          <button className={styles.chip} onClick={() => setOpenClassPicker(true)}>
            {classFilter ? classFilter : "всі"}
          </button>
        </div>
      )}

      <div className={styles.list}>
        {filteredSubs.length === 0 ? (
          <div className={styles.empty}>Нічого немає для вибраного фільтра.</div>
        ) : (
          filteredSubs.map((s, idx) => (
            <div key={`${s.classId}-${s.lessonNumber}-${idx}`} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardTitle}>
                  {s.classId} · {s.lessonNumber} урок
                </div>
                <span className={styles.badge}>{badgeLabel(s)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ClassPickerModal
        open={openClassPicker}
        title="Фільтр по класу"
        value={classFilter}
        options={CLASSES}
        onSelect={(v) => setClassFilter(v)}
        onClose={() => setOpenClassPicker(false)}
      />

      <CreateSubstitutionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={onCreate}
        teachers={teachers}
      />
    </div>
  );
}
