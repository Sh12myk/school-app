#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parse as parseCsv } from "csv-parse/sync";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const CHUNK_SIZE = 450;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_ERROR_PREVIEW = 20;

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    const [k, inlineValue] = token.slice(2).split("=");
    if (inlineValue !== undefined) {
      args[k] = inlineValue;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[k] = "true";
      continue;
    }

    args[k] = next;
    i += 1;
  }
  return args;
}

function normalizeString(value) {
  return String(value ?? "").trim();
}

function normalizeId(value) {
  return normalizeString(value).replace(/\s+/g, "").replace(/[\\/]/g, "_");
}

function stableLessonId({ classId, weekday, lessonNumber, start, teacherId }) {
  return [classId, weekday, lessonNumber, start, teacherId].map(normalizeId).join("__");
}

function parseIntField(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function validateTeacher(rec) {
  const id = normalizeString(rec.id);
  const name = normalizeString(rec.name);
  if (!id) return "teachers: missing id";
  if (!name) return "teachers: missing name";
  return null;
}

function validateClass(rec) {
  const id = normalizeString(rec.id);
  const name = normalizeString(rec.name);
  if (!id) return "classes: missing id";
  if (!name) return "classes: missing name";
  return null;
}

function validateLesson(rec) {
  const weekday = parseIntField(rec.weekday);
  const lessonNumber = parseIntField(rec.lessonNumber);
  const start = normalizeString(rec.start);
  const end = normalizeString(rec.end);
  const classId = normalizeString(rec.classId);
  const teacherId = normalizeString(rec.teacherId);

  if (!(weekday >= 1 && weekday <= 6)) return "lessons: weekday must be 1..6";
  if (!(lessonNumber >= 1 && lessonNumber <= 12)) return "lessons: lessonNumber must be 1..12";
  if (!TIME_RE.test(start)) return "lessons: invalid start time (HH:MM)";
  if (!TIME_RE.test(end)) return "lessons: invalid end time (HH:MM)";
  if (!classId) return "lessons: missing classId";
  if (!teacherId) return "lessons: missing teacherId";
  return null;
}

async function readInput(filePath, datasetName) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath, "utf8");

  if (ext === ".json") {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed[datasetName])) return parsed[datasetName];
    throw new Error(`JSON for ${datasetName} must be an array or object with key '${datasetName}'`);
  }

  if (ext === ".csv") {
    const rows = parseCsv(raw, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_quotes: true,
      trim: true,
    });
    return rows;
  }

  throw new Error(`Unsupported file extension for ${datasetName}: ${ext}`);
}

function samePayload(existing, incoming) {
  return Object.keys(incoming).every((k) => {
    const prev = existing?.[k];
    const next = incoming[k];
    return prev === next;
  });
}

async function processDataset({
  db,
  schoolId,
  datasetName,
  rows,
  validate,
  makeDoc,
  makeDocId,
  dryRun,
  counters,
  errors,
}) {
  const ops = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNum = i + 2; // csv: + header

    let docId;
    let payload;
    try {
      const validationError = validate(row);
      if (validationError) {
        counters.skipped += 1;
        if (errors.length < MAX_ERROR_PREVIEW) {
          errors.push({ dataset: datasetName, row: rowNum, reason: validationError, sample: row });
        }
        continue;
      }

      docId = makeDocId(row);
      payload = makeDoc(row);
      if (!docId) {
        counters.skipped += 1;
        if (errors.length < MAX_ERROR_PREVIEW) {
          errors.push({ dataset: datasetName, row: rowNum, reason: `${datasetName}: empty document id`, sample: row });
        }
        continue;
      }

      const ref = db.doc(`schools/${schoolId}/${datasetName}/${docId}`);
      const snap = await ref.get();

      if (snap.exists) {
        if (samePayload(snap.data(), payload)) {
          counters.skipped += 1;
          continue;
        }
        counters.updated += 1;
      } else {
        counters.created += 1;
      }

      if (!dryRun) {
        ops.push({ ref, payload });
      }
    } catch (err) {
      counters.skipped += 1;
      if (errors.length < MAX_ERROR_PREVIEW) {
        errors.push({
          dataset: datasetName,
          row: rowNum,
          reason: err instanceof Error ? err.message : String(err),
          sample: row,
        });
      }
    }
  }

  if (dryRun || ops.length === 0) return;

  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const chunk = ops.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();
    for (const op of chunk) {
      batch.set(op.ref, op.payload, { merge: true });
    }
    await batch.commit();
  }
}

function initAdmin() {
  if (getApps().length) return;

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccountPath) {
    // Explicitly support service account JSON path from env.
    const resolvedPath = path.resolve(serviceAccountPath);
    return fs.readFile(resolvedPath, "utf8")
      .then((raw) => {
        const serviceAccount = JSON.parse(raw);
        initializeApp({ credential: cert(serviceAccount) });
      });
  }

  initializeApp({ credential: applicationDefault() });
  return Promise.resolve();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const schoolId = normalizeString(args["school-id"] ?? process.env.SCHOOL_ID);

  if (!schoolId) {
    throw new Error("Missing SCHOOL_ID. Set env SCHOOL_ID or pass --school-id=school1");
  }

  const teachersPath = args.teachers ?? "./teachers.csv";
  const classesPath = args.classes ?? "./classes.csv";
  const lessonsPath = args.lessons ?? "./lessons.csv";
  const dryRun = Boolean(args.dryRun);

  await initAdmin();
  const db = getFirestore();

  const [teachersRows, classesRows, lessonsRows] = await Promise.all([
    readInput(teachersPath, "teachers"),
    readInput(classesPath, "classes"),
    readInput(lessonsPath, "lessons"),
  ]);

  const counters = { created: 0, updated: 0, skipped: 0 };
  const errors = [];

  await processDataset({
    db,
    schoolId,
    datasetName: "teachers",
    rows: teachersRows,
    validate: validateTeacher,
    makeDocId: (r) => normalizeId(r.id),
    makeDoc: (r) => ({
      id: normalizeString(r.id),
      name: normalizeString(r.name),
      importedAt: new Date().toISOString(),
    }),
    dryRun,
    counters,
    errors,
  });

  await processDataset({
    db,
    schoolId,
    datasetName: "classes",
    rows: classesRows,
    validate: validateClass,
    makeDocId: (r) => normalizeId(r.id),
    makeDoc: (r) => ({
      id: normalizeString(r.id),
      name: normalizeString(r.name),
      importedAt: new Date().toISOString(),
    }),
    dryRun,
    counters,
    errors,
  });

  await processDataset({
    db,
    schoolId,
    datasetName: "lessons",
    rows: lessonsRows,
    validate: validateLesson,
    makeDocId: (r) => stableLessonId({
      classId: r.classId,
      weekday: r.weekday,
      lessonNumber: r.lessonNumber,
      start: r.start,
      teacherId: r.teacherId,
    }),
    makeDoc: (r) => ({
      stableLessonId: stableLessonId({
        classId: r.classId,
        weekday: r.weekday,
        lessonNumber: r.lessonNumber,
        start: r.start,
        teacherId: r.teacherId,
      }),
      weekday: parseIntField(r.weekday),
      lessonNumber: parseIntField(r.lessonNumber),
      start: normalizeString(r.start),
      end: normalizeString(r.end),
      classId: normalizeString(r.classId),
      subject: normalizeString(r.subject),
      room: normalizeString(r.room),
      teacherId: normalizeString(r.teacherId),
      importedAt: new Date().toISOString(),
    }),
    dryRun,
    counters,
    errors,
  });

  console.log("\n=== Firestore import finished ===");
  console.log(`schoolId: ${schoolId}`);
  console.log(`mode: ${dryRun ? "DRY-RUN" : "WRITE"}`);
  console.log(`created: ${counters.created}`);
  console.log(`updated: ${counters.updated}`);
  console.log(`skipped: ${counters.skipped}`);

  if (errors.length > 0) {
    console.log(`\nFirst ${errors.length} invalid rows:`);
    for (const e of errors) {
      console.log(`- [${e.dataset}] row ${e.row}: ${e.reason}`);
    }
  }
}

main().catch((err) => {
  console.error("Import failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
