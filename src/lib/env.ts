function req(name: string) {
  const v = import.meta.env[name] as string | undefined;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  firebase: {
    apiKey: req("VITE_FIREBASE_API_KEY"),
    authDomain: req("VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: req("VITE_FIREBASE_PROJECT_ID"),
    storageBucket: req("VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: req("VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: req("VITE_FIREBASE_APP_ID"),
    measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ?? undefined,
  },
  attendanceFormUrl: (import.meta.env.VITE_ATTENDANCE_FORM_URL as string | undefined) ?? "",
};
