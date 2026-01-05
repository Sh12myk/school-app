import { useEffect, useState } from "react";
import { read, subscribe, write } from "../data/store";

export function useStoreValue<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(() => read<T>(key, seed));

  useEffect(() => {
    return subscribe(key, () => setValue(read<T>(key, seed)));
  }, [key, seed]);

  const set = (next: T | ((prev: T) => T)) => {
    const prev = read<T>(key, seed);
    const val = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
    write<T>(key, val);
  };

  return { value, setValue: set };
}
