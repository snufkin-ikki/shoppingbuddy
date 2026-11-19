"use client";

import { useRef, useState, type FormEvent } from "react";
import { maxAreaLength, maxDescriptionLength, maxLineContactLength, maxBuddySearchBudget, normalizeBuddySearchBudget, normalizeLineContact } from "../buddy-search-request";

import { minimumRespectFee } from "../directory-data";
import { homeHref, type SiteLanguage } from "../site-language";
import { finderCopy } from "./copy";

export default function BuddySearchForm({ initialArea, initialDescription, initialBudget, language }: {
  initialArea: string; initialDescription: string; initialBudget: number | null; language: SiteLanguage;
}) {
  const copy = finderCopy[language];
  const [lineKind, setLineKind] = useState<"id" | "link">("id");
  const [status, setStatus] = useState<"ready" | "sending" | "sent">("ready");
  const [error, setError] = useState("");
  const contactRef = useRef<HTMLInputElement>(null);
  const requestId = useRef("");
  const inFlight = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    const area = String(form.get("area") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const budget = normalizeBuddySearchBudget(form.get("budget"));
    const lineContact = normalizeLineContact(lineKind, form.get("lineContact"));
    if (!area || !description) {
      setError(copy.missing);
      return;
    }
    if (budget === null) {
      setError(copy.badBudget(minimumRespectFee.toLocaleString(language)));
      return;
    }
    if (!lineContact) {
      setError(lineKind === "id" ? copy.badId : copy.badLink);
      contactRef.current?.focus();
      return;
    }

    inFlight.current = true;
    requestId.current ||= crypto.randomUUID();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/buddy-search-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId.current, area, description, budget, lineKind, lineContact, website: form.get("website") }),
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        setStatus("sent");
        return;
      }
      setError((language === "ja" ? result.error : null) ?? copy.failed);
    } catch {
      setError(copy.offline);
    } finally {
      inFlight.current = false;
    }
    setStatus("ready");
  }

  if (status === "sent") return <div className="buddy-finder-receipt" role="status">
    <h2>{copy.received}</h2>
    <p>{copy.receipt}</p>
    <a href={homeHref(language, "#directory")}>{copy.directory} →</a>
  </div>;

  return <form className="buddy-finder-form" onSubmit={submit} onChange={() => { requestId.current = ""; setError(""); }}>
    <fieldset className="buddy-finder-fields" disabled={status === "sending"}>
      <label>{copy.area} <span>{copy.required}</span>
        <input name="area" required maxLength={maxAreaLength} defaultValue={initialArea} placeholder={copy.areaExample} />
      </label>
      <label>{copy.description} <span>{copy.required}</span>
        <textarea name="description" required maxLength={maxDescriptionLength} rows={4} defaultValue={initialDescription}
          placeholder={copy.descriptionExample} />
      </label>
      <label>{copy.budget} <span>{copy.required}</span>
        <input name="budget" type="number" inputMode="numeric" required step={1} min={minimumRespectFee}
          max={maxBuddySearchBudget} defaultValue={initialBudget ?? undefined} placeholder={copy.budgetExample}
          aria-describedby="buddy-finder-budget-note" />
        <small id="buddy-finder-budget-note">{copy.budgetNote(minimumRespectFee.toLocaleString(language))}</small>
      </label>
      <fieldset className="buddy-finder-contact" aria-describedby="buddy-finder-contact-note">
        <legend>{copy.contact} <span>{copy.either}</span></legend>
        <div className="buddy-finder-options">
          <label><input type="radio" name="lineKind" checked={lineKind === "id"} onChange={() => setLineKind("id")} /> LINE ID</label>
          <label><input type="radio" name="lineKind" checked={lineKind === "link"} onChange={() => setLineKind("link")} /> {copy.link}</label>
        </div>
        <label>{lineKind === "id" ? copy.yourId : copy.yourLink}
          <input key={lineKind} ref={contactRef} name="lineContact" type="text" inputMode={lineKind === "link" ? "url" : "text"}
            autoCapitalize="none" autoCorrect="off" spellCheck={false} required maxLength={lineKind === "id" ? 65 : maxLineContactLength}
            placeholder={lineKind === "id" ? copy.idExample : "https://line.me/ti/p/…"} />
        </label>
        <p id="buddy-finder-contact-note">{copy.privacy}</p>
      </fieldset>
      <div hidden><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className="buddy-finder-error">{error}</p>}
      <button className="vintage-primary" type="submit">{status === "sending" ? copy.sending : copy.send}</button>
    </fieldset>
  </form>;
}
