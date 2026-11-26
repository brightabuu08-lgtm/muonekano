// © Bright Abuu. Haki zote zimehifadhiwa.
import { Tr } from "@/app/_components/Tr";
import type { NoteProps } from "../types";

/** Kidokezo cha usalama chini ya fomu za kuingia. Rangi zinatoka kwenye vigezo vya theme (--g-*). */
export function LockNote({ children }: NoteProps) {
  return (
    <div className="gate-note">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </svg>
      <p>{typeof children === "string" ? <Tr>{children}</Tr> : children}</p>
    </div>
  );
}
