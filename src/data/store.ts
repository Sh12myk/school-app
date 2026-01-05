const EVENT_NAME = "schoolapp:store";

type StoreEventDetail = { key: string };

function emit(key: string) {
  window.dispatchEvent(new CustomEvent<StoreEventDetail>(EVENT_NAME, { detail: { key } }));
}

export function read<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return seed;
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

export function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
  emit(key);
}

export function update<T>(key: string, seed: T, updater: (prev: T) => T): T {
  const prev = read<T>(key, seed);
  const next = updater(prev);
  write<T>(key, next);
  return next;
}

export function subscribe(key: string, cb: () => void) {
  const onCustom = (e: Event) => {
    const ce = e as CustomEvent<StoreEventDetail>;
    if (ce.detail?.key === key) cb();
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) cb();
  };

  window.addEventListener(EVENT_NAME, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
