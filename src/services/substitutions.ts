import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/client";
import type { Substitution } from "../types";

type SubDoc = Omit<Substitution, "createdAt"> & { createdAt?: any };

function toMs(x: any): number | undefined {
  if (!x) return undefined;
  if (typeof x?.toMillis === "function") return x.toMillis();
  return undefined;
}

export function subscribeSubstitutions(date: string, onData: (items: Substitution[]) => void) {
  const q = query(
    collection(db, "substitutions"),
    where("date", "==", date),
    orderBy("lessonNumber", "asc")
  );

  return onSnapshot(q, (snap) => {
    const items: Substitution[] = snap.docs.map((d) => {
      const data = d.data() as SubDoc;
      const base: any = {
        classId: data.classId,
        lessonNumber: data.lessonNumber,
        status: data.status,
        date: data.date,
        createdBy: (data as any).createdBy,
        createdAt: toMs((data as any).createdAt),
      };

      if (data.status === "cancelled") return base as Substitution;
      if (data.status === "room_changed") return { ...base, room: (data as any).room } as Substitution;
      return { ...base, toTeacherId: (data as any).toTeacherId, room: (data as any).room } as Substitution;
    });

    onData(items);
  });
}

export async function createSubstitution(uid: string, s: Substitution, date: string) {
  await addDoc(collection(db, "substitutions"), {
    ...s,
    date,
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
}
