import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/client";
import type { Announcement, Audience } from "../types";

type AnnouncementDoc = Omit<Announcement, "id" | "createdAt"> & {
  createdAt?: any; // Firestore Timestamp
};

function toMs(x: any): number | undefined {
  if (!x) return undefined;
  if (typeof x?.toMillis === "function") return x.toMillis();
  return undefined;
}

export function subscribeAnnouncements(onData: (items: Announcement[]) => void) {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items: Announcement[] = snap.docs.map((d) => {
      const data = d.data() as AnnouncementDoc;
      return {
        id: d.id,
        type: data.type,
        title: data.title,
        requiresAck: !!data.requiresAck,
        audience: data.audience as Audience | undefined,
        createdBy: data.createdBy,
        createdAt: toMs(data.createdAt),
      };
    });
    onData(items);
  });
}

export async function createAnnouncement(input: {
  title: string;
  type: Announcement["type"];
  requiresAck: boolean;
  audience: Audience;
  createdBy: string;
}) {
  await addDoc(collection(db, "announcements"), {
    title: input.title,
    type: input.type,
    requiresAck: input.requiresAck,
    audience: input.audience,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  });
}

// acks are stored per-user: users/{uid}/acks/{announcementId}
export function subscribeAckedIds(uid: string, onData: (set: Set<string>) => void) {
  const ref = collection(db, "users", uid, "acks");
  return onSnapshot(ref, (snap) => {
    const s = new Set<string>();
    snap.docs.forEach((d) => s.add(d.id));
    onData(s);
  });
}

export async function ackAnnouncement(uid: string, announcementId: string) {
  const ref = doc(db, "users", uid, "acks", announcementId);
  await setDoc(ref, { at: serverTimestamp() }, { merge: true });
}
