"use client";
// © Bright Abuu. Haki zote zimehifadhiwa.
// Brand 01b: baada ya kuskani QR moja ya mgahawa, mteja anachagua meza yake (au delivery).
// Chaguo linahifadhiwa kwa tab hii tu (sessionStorage), kama kikapu.
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useT } from "@/app/_components/Lang";
import { acceptTable, tableNumbers, type TableSetup } from "./tables";

export type TableChoice = { kind: "table"; table: string } | { kind: "delivery" };

const key = (slug: string) => `resto-table:${slug}`;
const listeners = new Set<() => void>();
const SERVER = "server";

/** Chaguo lililohifadhiwa → TableChoice, au null kama halipo au si sahihi (halijaaminiwa). */
export function parseChoice(raw: string | null): TableChoice | null {
  if (!raw) return null;
  if (raw === "delivery") return { kind: "delivery" };
  const m = /^table:(.{1,20})$/.exec(raw);
  return m?.[1] ? { kind: "table", table: m[1] } : null;
}

const serialize = (c: TableChoice) => (c.kind === "delivery" ? "delivery" : `table:${c.table}`);

function read(slug: string): string | null {
  try {
    return globalThis.sessionStorage?.getItem(key(slug)) ?? null;
  } catch {
    return null;
  }
}

function write(slug: string, c: TableChoice): void {
  try {
    globalThis.sessionStorage?.setItem(key(slug), serialize(c));
  } catch {
    /* kuhifadhi ni hiari */
  }
  for (const l of listeners) l();
}

/**
 * Chaguo la meza la tab hii. `ready` ni false wakati wa kuchora kwenye server (hakuna sessionStorage),
 * ili skrini ya kuchagua isionyeshwe kabla ya kujua kama mteja ameshachagua.
 */
export function useTableChoice(slug: string): { ready: boolean; choice: TableChoice | null; set: (c: TableChoice) => void } {
  const raw = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => read(slug) ?? "",
    () => SERVER,
  );
  return { ready: raw !== SERVER, choice: raw === SERVER ? null : parseChoice(raw), set: (c) => write(slug, c) };
}

type Props = {
  setup: TableSetup;
  current: string;
  onPick: (table: string) => void;
  onDelivery: () => void;
  /** Ipo pale mteja ameshachagua kabla (anabadilisha): kurudi bila kubadilisha. */
  onCancel?: () => void;
};

export function TablePicker({ setup, current, onPick, onDelivery, onCancel }: Props) {
  const t = useT();
  const numbers = tableNumbers(setup);
  const [typed, setTyped] = useState(current);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const ok = acceptTable(setup, typed);
    if (!ok) {
      setError(t("Andika namba ya meza iliyo kwenye kibao cha meza yako."));
      return;
    }
    onPick(ok);
  }

  return (
    <section className="dm-pick" aria-labelledby="dm-pick-title">
      <h2 id="dm-pick-title">{t("Uko meza namba ngapi?")}</h2>
      <p className="dm-mut">{t("Namba iko kwenye kibao cha meza yako.")}</p>

      {numbers.length > 0 ? (
        <div className="dm-tables" role="group" aria-label={t("Namba ya meza")}>
          {numbers.map((n) => (
            <button key={n} type="button" className="dm-table" aria-pressed={n === current} onClick={() => onPick(n)}>
              {n}
            </button>
          ))}
        </div>
      ) : (
        <form className="dm-pick-form" onSubmit={submit} noValidate>
          <label htmlFor="dm-table-no">{t("Namba ya meza")}</label>
          <input
            id="dm-table-no"
            inputMode="numeric"
            autoComplete="off"
            maxLength={20}
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "dm-table-err" : undefined}
          />
          {error && (
            <p id="dm-table-err" className="dm-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="dm-btn dm-primary">
            {t("Fungua menu")}
          </button>
        </form>
      )}

      <p className="dm-or">{t("Au")}</p>
      <div className="dm-pick-alt">
        <button type="button" className="dm-btn" onClick={onDelivery}>
          {t("Niletewe (delivery)")}
        </button>
        {onCancel && (
          <button type="button" className="dm-btn" onClick={onCancel}>
            {t("Rudi kwenye menu")}
          </button>
        )}
      </div>
    </section>
  );
}
