/**
 * Teacher classifier module — determines whether a candidate should be
 * included on lineage.guide based on heuristic keyword matching.
 *
 * Pure, deterministic function. No LLM or API calls.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawCandidate {
  name: string;
  bio: string;
  source: string;
}

export interface Classification {
  traditions: string[];
  status: "accepted" | "rejected";
  reject_reason?: string;
}

// ---------------------------------------------------------------------------
// Tradition keyword map
// ---------------------------------------------------------------------------

const TRADITION_KEYWORDS: Record<string, string[]> = {
  "advaita-vedanta": [
    "advaita",
    "advaita vedanta",
    "non-duality",
    "nonduality",
    "atman",
    "self-inquiry",
    "self-realization",
    "ramana",
  ],
  bhakti: [
    "bhakti",
    "kirtan",
    "devotional",
    "hare krishna",
    "chanting",
    "bhajan",
  ],
  "chan-buddhism": ["chan buddhis", "chan master", "chan meditation"],
  "christian-mysticism": [
    "christian mystic",
    "centering prayer",
    "contemplative prayer",
    "desert fathers",
    "meister eckhart",
    "thomas merton",
    "cloud of unknowing",
  ],
  "classical-yoga": [
    "yoga sutra",
    "yoga philosophy",
    "patanjali",
    "ashtanga yoga philosophy",
    "raja yoga",
    "classical yoga",
    "pranayama",
  ],
  dzogchen: ["dzogchen", "great perfection", "rigpa", "trekchö", "tögal"],
  "early-buddhism": [
    "early buddhis",
    "pali canon",
    "theravada",
    "sutta",
    "nikaya",
  ],
  gnosticism: ["gnostic", "gnosticism", "nag hammadi"],
  hesychasm: [
    "hesychasm",
    "hesychast",
    "jesus prayer",
    "philokalia",
    "orthodox contemplative",
  ],
  jainism: ["jain", "jainism", "ahimsa", "mahavira", "digambara", "svetambara"],
  kabbalah: ["kabbalah", "kabbalistic", "sephirot", "zohar", "hasidic"],
  "kashmir-shaivism": [
    "kashmir shaivism",
    "trika",
    "spanda",
    "pratyabhijna",
    "shiva sutras",
  ],
  mahayana: [
    "mahayana",
    "bodhisattva",
    "prajnaparamita",
    "heart sutra",
    "lotus sutra",
  ],
  "modern-non-dual": [
    "non-dual",
    "nondual",
    "modern nondual",
    "direct path",
    "direct pointing",
  ],
  neoplatonism: ["neoplatonism", "neoplatonic", "plotinus", "henosis"],
  "quaker-inner-light": [
    "quaker",
    "inner light",
    "friends meeting",
    "society of friends",
  ],
  "secular-mindfulness": [
    "mindfulness",
    "mbsr",
    "mindfulness-based",
    "mindful",
    "secular meditation",
  ],
  sufism: [
    "sufi",
    "sufism",
    "whirling",
    "dervish",
    "rumi",
    "dhikr",
    "zikr",
    "tariqa",
  ],
  "tai-chi-qigong": [
    "tai chi",
    "taiji",
    "qigong",
    "qi gong",
    "chi kung",
    "tai-chi",
  ],
  tantra: [
    "tantra",
    "tantric",
    "kundalini",
    "shakti",
    "tantric meditation",
  ],
  taoism: ["taoist", "taoism", "daoist", "daoism", "tao te ching", "dao"],
  theravada: ["theravada", "theravāda", "pali", "vinaya", "bhikkhu"],
  "tibetan-buddhism-gelug": [
    "gelug",
    "gelugpa",
    "dalai lama",
    "tibetan buddhis",
    "lam rim",
    "lamrim",
  ],
  vajrayana: [
    "vajrayana",
    "vajra",
    "tibetan buddhist",
    "dzogchen",
    "mahamudra",
    "tantric buddhis",
  ],
  vedanta: ["vedanta", "vedantic", "upanishad", "brahman"],
  "vipassana-movement": [
    "vipassana",
    "insight meditation",
    "body scan",
    "noting practice",
    "goenka",
  ],
  zen: ["zen", "zazen", "rinzai", "soto", "koan", "roshi", "sesshin"],
};

// ---------------------------------------------------------------------------
// Exclusion keyword lists
// ---------------------------------------------------------------------------

const EXCLUSION_THERAPIST = [
  "therapist",
  "psychologist",
  "psychotherapy",
  "psychotherapist",
  "licensed clinical",
  "lcsw",
  "ifs",
  "somatic experiencing",
  "emdr",
];

const EXCLUSION_SELF_HELP = [
  "life coach",
  "motivational speaker",
  "self-help",
  "personal development",
];

const EXCLUSION_NEW_AGE = [
  "channeling",
  "witchcraft",
  "psychic",
  "astrology",
  "tarot",
];

const YOGA_ONLY_KEYWORDS = [
  "yoga",
  "vinyasa",
  "hatha",
  "ashtanga",
  "power yoga",
  "hot yoga",
  "yin yoga",
  "yoga instructor",
  "yoga teacher",
];

const YOGA_CONTEMPLATIVE_INDICATORS = [
  "meditation",
  "contemplative",
  "pranayama",
  "yoga philosophy",
  "yoga sutra",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize diacritics and lowercase for comparison. */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function bioContainsAny(bio: string, keywords: string[]): boolean {
  const lower = bio.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

export function classifyCandidate(
  candidate: RawCandidate,
  existingTeacherNames: string[],
): Classification {
  const bio = candidate.bio;
  const normalizedName = normalize(candidate.name);

  // 1. Duplicate detection
  for (const existing of existingTeacherNames) {
    if (normalize(existing) === normalizedName) {
      return { traditions: [], status: "rejected", reject_reason: "duplicate" };
    }
  }

  // 2. Exclusion rules (check before tradition matching)
  if (bioContainsAny(bio, EXCLUSION_THERAPIST)) {
    return { traditions: [], status: "rejected", reject_reason: "therapist" };
  }
  if (bioContainsAny(bio, EXCLUSION_SELF_HELP)) {
    return { traditions: [], status: "rejected", reject_reason: "self-help" };
  }
  if (bioContainsAny(bio, EXCLUSION_NEW_AGE)) {
    return { traditions: [], status: "rejected", reject_reason: "new-age" };
  }

  // 3. Tradition matching
  const matchedTraditions: string[] = [];
  for (const [tradition, keywords] of Object.entries(TRADITION_KEYWORDS)) {
    if (bioContainsAny(bio, keywords)) {
      matchedTraditions.push(tradition);
    }
  }

  // 4. Yoga-only check: if the only signal is generic yoga keywords
  //    with no contemplative indicators, reject.
  if (matchedTraditions.length === 0) {
    const hasYogaKeywords = bioContainsAny(bio, YOGA_ONLY_KEYWORDS);
    const hasContemplative = bioContainsAny(bio, YOGA_CONTEMPLATIVE_INDICATORS);
    if (hasYogaKeywords && !hasContemplative) {
      return {
        traditions: [],
        status: "rejected",
        reject_reason: "yoga-non-contemplative",
      };
    }
  }

  // 5. No tradition match at all
  if (matchedTraditions.length === 0) {
    return {
      traditions: [],
      status: "rejected",
      reject_reason: "no-tradition-match",
    };
  }

  return { traditions: matchedTraditions, status: "accepted" };
}
