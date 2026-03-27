# One-time Firestore import (school data)

Ця інструкція описує одноразовий імпорт великої бази у Firestore для однієї школи.

## Що імпортуємо

Скрипт `scripts/import-firestore.mjs` імпортує:

- `teachers` → `/schools/{schoolId}/teachers/{teacherId}`
- `classes` → `/schools/{schoolId}/classes/{classId}`
- `lessons` → `/schools/{schoolId}/lessons/{stableLessonId}`

`stableLessonId` формується стабільно:

```txt
${classId}__${weekday}__${lessonNumber}__${start}__${teacherId}
```

(з очищенням пробілів та заміною `/` на `_`), тому повторний запуск робить upsert, а не дублює документи.

## Передумови

1. Увімкни Firestore у Firebase-проєкті (Firebase Console).
2. Створи Service Account key (JSON) у Google Cloud / Firebase project.
3. Service account має мати права доступу до Firestore (наприклад, роль Firestore User/Editor або вище відповідно до політики вашого проєкту).

## Формат файлів

### `teachers.csv`

```csv
id,name
u1,Іванюк Софія
u2,Торкаєнко Ірина
```

### `classes.csv`

```csv
id,name
1-А,1-А
1-Б,1-Б
```

### `lessons.csv`

```csv
weekday,lessonNumber,start,end,classId,subject,room,teacherId
1,1,08:30,09:15,7-Б,Математика,215,u2
```

Підтримуються також `*.json` файли (масив об'єктів або об'єкт з ключем `teachers/classes/lessons`).

## Валідація

Мінімальна валідація:

- `teachers`: обов’язкові `id`, `name`
- `classes`: обов’язкові `id`, `name`
- `lessons`: `weekday(1-6)`, `lessonNumber(1-12)`, `start/end` у форматі `HH:MM`, `classId`, `teacherId`

## Запуск

Скрипт очікує:

- `SCHOOL_ID` (наприклад `school1`)
- `GOOGLE_APPLICATION_CREDENTIALS` (шлях до `serviceAccountKey.json`)

### Bash (Linux/macOS)

```bash
SCHOOL_ID=school1 \
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
npm run import:firestore -- \
  --teachers ./teachers.csv \
  --classes ./classes.csv \
  --lessons ./lessons.csv
```

### Windows PowerShell

```powershell
$env:SCHOOL_ID="school1"
$env:GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
npm run import:firestore -- --teachers ./teachers.csv --classes ./classes.csv --lessons ./lessons.csv
```

## Dry-run режим

Перевірка без запису в Firestore:

```bash
SCHOOL_ID=school1 GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json npm run import:firestore -- --teachers ./teachers.csv --classes ./classes.csv --lessons ./lessons.csv --dry-run
```

## Логи

Після завершення скрипт виводить:

- `created`
- `updated`
- `skipped`
- перші 20 помилкових рядків з причиною.
