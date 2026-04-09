"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/testimonies";
import type { YearsOfPractice } from "@/lib/types";

const TRADITIONS = [
  "Zen",
  "Vipassana",
  "Tibetan Buddhism",
  "Theravada",
  "Advaita Vedanta",
  "Yoga",
  "Sufism",
  "Christian Contemplative",
  "Taoism",
  "Secular Mindfulness",
  "Other",
];

const PRACTICE_YEARS: { label: string; value: YearsOfPractice }[] = [
  { label: "Less than a year", value: "<1" },
  { label: "1–3 years", value: "1-3" },
  { label: "3–10 years", value: "3-10" },
  { label: "10+ years", value: "10+" },
];

interface ProfileCompletionProps {
  userId: string;
  onComplete: () => void;
}

export function ProfileCompletion({ userId, onComplete }: ProfileCompletionProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [practiceBackground, setPracticeBackground] = useState("");
  const [traditions, setTraditions] = useState<string[]>([]);
  const [years, setYears] = useState<YearsOfPractice | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleTradition(t: string) {
    setTraditions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    try {
      await updateProfile(userId, {
        display_name: displayName || null,
        bio: bio || null,
        practice_background: practiceBackground || null,
        traditions,
        years_of_practice: years,
      });
      onComplete();
    } catch {
      setErrorMsg("Something went wrong saving your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div>
        <p className="font-serif text-lg font-medium text-foreground">
          A little about you
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional — helps others understand your perspective
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you'd like to be known"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A sentence or two about yourself"
          maxLength={500}
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">{bio.length}/500</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Practice background</label>
        <textarea
          value={practiceBackground}
          onChange={(e) => setPracticeBackground(e.target.value)}
          placeholder="How did you come to contemplative practice?"
          maxLength={1000}
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">{practiceBackground.length}/1000</p>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Traditions you have experience with
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRADITIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTradition(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                traditions.includes(t)
                  ? "bg-terracotta text-white border-terracotta"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Years of practice</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRACTICE_YEARS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setYears(years === value ? null : value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                years === value
                  ? "bg-terracotta text-white border-terracotta"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-terracotta px-5 py-2 text-sm font-medium text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onComplete}
          className="rounded-md px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
