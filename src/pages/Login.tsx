import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuthUser } from "../hooks/useAuthUser";
import styles from "./Login.module.css";

function isPopupBlockedError(code?: string) {
  return (
    code === "auth/popup-blocked" ||
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

export default function Login() {
  const { user, loading } = useAuthUser();
  const nav = useNavigate();
  const loc = useLocation();

  const from = (loc.state as any)?.from ?? "/today";

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // якщо login був через redirect — “допроходимо” результат
  useEffect(() => {
    getRedirectResult(auth).catch(() => {
      // якщо redirect не було — це нормально
    });
  }, []);

  // якщо user зʼявився — перекидаємо
  useEffect(() => {
    if (!loading && user) {
      nav(from, { replace: true });
    }
  }, [loading, user, from, nav]);

  const loginEmail = async () => {
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e: any) {
      setErr(e?.message ?? "Помилка входу");
    } finally {
      setBusy(false);
    }
  };

  const loginGoogle = async () => {
    setErr(null);
    setBusy(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        await signInWithPopup(auth, provider);
      } catch (e: any) {
        const code = e?.code as string | undefined;
        if (isPopupBlockedError(code)) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw e;
      }
    } catch (e: any) {
      setErr(e?.message ?? "Помилка Google входу");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Вхід</h1>

      {err && <div className={styles.error}>{err}</div>}

      <div className={styles.form}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          placeholder="Пароль"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete="current-password"
        />

        <button onClick={loginEmail} disabled={busy || !email || !pass}>
          Увійти
        </button>

        <button onClick={loginGoogle} disabled={busy}>
          Увійти через Google
        </button>

        <div className={styles.note}>
          Після входу перекине на: <b>{from}</b>
        </div>
      </div>
    </div>
  );
}