#!/usr/bin/env npx tsx
/**
 * research-sources.ts — Generate authoritative resource JSON files for traditions.
 *
 * Uses a curated knowledge base (no web requests). Targets 3-5 NEW sources per
 * tradition that don't already exist in data/resources/.
 *
 * Usage:
 *   npx tsx scripts/research-sources.ts              # generate all
 *   npx tsx scripts/research-sources.ts --dry-run     # preview only
 *   npx tsx scripts/research-sources.ts --tradition zen
 */

import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ResourceCategory =
  | "primary_text"
  | "academic"
  | "popular"
  | "encyclopedia"
  | "web_resource";

type ResourceType = "book" | "website" | "article" | "video" | "podcast";

interface ResourceFile {
  title: string;
  slug: string;
  type: ResourceType;
  url: string;
  author: string | null;
  year: number | null;
  description: string;
  traditions: string[];
  teachers: string[];
  centers: string[];
  category: ResourceCategory;
}

// ---------------------------------------------------------------------------
// Curated knowledge base — authoritative sources per tradition
// ---------------------------------------------------------------------------

const SOURCES_DB: Record<string, Omit<ResourceFile, "slug">[]> = {
  theravada: [
    {
      title: "Theravada Buddhism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/theravada/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia of Philosophy entry on Theravada Buddhist philosophy, doctrine, and history.",
      traditions: ["theravada"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Sutta Central",
      type: "website",
      url: "https://suttacentral.net",
      author: null,
      year: 2005,
      description:
        "Free multilingual repository of early Buddhist texts with translations of the Pali Canon and parallels in Chinese, Sanskrit, and Tibetan.",
      traditions: ["theravada", "early-buddhism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Dhammapada",
      type: "book",
      url: "https://bookshop.org/p/books/the-dhammapada-a-new-translation-of-the-buddhist-classic-with-annotations-gil-fronsdal/6672068",
      author: "Gil Fronsdal (trans.)",
      year: 2005,
      description:
        "One of the most widely read and best-known early Buddhist texts, a collection of 423 verses attributed to the Buddha.",
      traditions: ["theravada", "early-buddhism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "The Long Discourses of the Buddha (Digha Nikaya)",
      type: "book",
      url: "https://bookshop.org/p/books/the-long-discourses-of-the-buddha-a-translation-of-the-digha-nikaya-maurice-walshe/8200762",
      author: "Maurice Walshe (trans.)",
      year: 1995,
      description:
        "Complete English translation of the Digha Nikaya, the collection of the Buddha's longer discourses from the Pali Canon.",
      traditions: ["theravada", "early-buddhism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  zen: [
    {
      title: "Zen Buddhism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/japanese-zen/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia of Philosophy entry covering the philosophy, history, and key concepts of Japanese Zen Buddhism.",
      traditions: ["zen"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Gateless Gate (Mumonkan)",
      type: "book",
      url: "https://bookshop.org/p/books/the-gateless-barrier-the-wu-men-kuan-mumonkan-robert-aitken/10477072",
      author: "Robert Aitken (trans.)",
      year: 1990,
      description:
        "Classic collection of 48 Zen koans compiled in 1228 by Chinese Zen master Wumen Huikai, with commentary.",
      traditions: ["zen", "chan-buddhism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Terebess Asia Online",
      type: "website",
      url: "https://terebess.hu/english/",
      author: null,
      year: null,
      description:
        "Extensive free archive of Zen and Chan Buddhist texts, translations, and resources in multiple languages.",
      traditions: ["zen", "chan-buddhism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Blue Cliff Record",
      type: "book",
      url: "https://bookshop.org/p/books/the-blue-cliff-record-thomas-cleary/12603924",
      author: "Thomas Cleary (trans.)",
      year: 1977,
      description:
        "One of the great collections of Zen koans, compiled in 12th-century China — 100 cases with commentary and verse.",
      traditions: ["zen", "chan-buddhism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  sufism: [
    {
      title: "Sufism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/sufism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the mystical tradition of Islam, covering key concepts, history, and philosophical dimensions.",
      traditions: ["sufism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Revival of the Religious Sciences (Ihya Ulum al-Din)",
      type: "book",
      url: "https://bookshop.org/p/books/the-alchemy-of-happiness-abu-hamid-al-ghazali/8488152",
      author: "Abu Hamid al-Ghazali",
      year: 1106,
      description:
        "Al-Ghazali's magnum opus integrating Sufi spirituality with orthodox Islamic scholarship, available via his abridged Alchemy of Happiness.",
      traditions: ["sufism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Sacred Texts: Islam",
      type: "website",
      url: "https://sacred-texts.com/isl/index.htm",
      author: null,
      year: null,
      description:
        "Free online collection of classic Islamic and Sufi texts including works by Rumi, al-Ghazali, and other mystics.",
      traditions: ["sufism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Fusus al-Hikam (The Bezels of Wisdom)",
      type: "book",
      url: "https://bookshop.org/p/books/the-bezels-of-wisdom-ibn-al-arabi/11326880",
      author: "Ibn al-Arabi",
      year: 1229,
      description:
        "Ibn Arabi's most concentrated metaphysical work, presenting mystical wisdom through the lens of 27 prophets.",
      traditions: ["sufism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  "advaita-vedanta": [
    {
      title: "Advaita Vedanta (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/advaita-vedanta/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the non-dualist school of Hindu philosophy founded by Shankara.",
      traditions: ["advaita-vedanta", "vedanta"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Vivekachudamani (Crest-Jewel of Discrimination)",
      type: "book",
      url: "https://bookshop.org/p/books/shankara-s-crest-jewel-of-discrimination-swami-prabhavananda/6714988",
      author: "Adi Shankara",
      year: 788,
      description:
        "Shankara's classic verse text on Advaita Vedanta philosophy, outlining the path to self-realization through discrimination between the real and unreal.",
      traditions: ["advaita-vedanta", "vedanta"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Sacred Texts: Hinduism",
      type: "website",
      url: "https://sacred-texts.com/hin/index.htm",
      author: null,
      year: null,
      description:
        "Free online library of Hindu sacred texts including Upanishads, Vedas, the Gita, and Vedantic philosophical works.",
      traditions: ["advaita-vedanta", "vedanta", "bhakti", "classical-yoga", "kashmir-shaivism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Mandukya Upanishad with Gaudapada's Karika",
      type: "book",
      url: "https://bookshop.org/p/books/eight-upanishads-with-the-commentary-of-shankaracharya-vol-2-swami-gambhirananda/12530074",
      author: "Gaudapada / Shankara (commentary)",
      year: null,
      description:
        "The shortest yet most philosophically dense Upanishad, foundational to Advaita, with Gaudapada's seminal non-dual commentary.",
      traditions: ["advaita-vedanta", "vedanta"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  vedanta: [
    {
      title: "Vedanta (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/vedanta/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia overview of the Vedanta schools of Hindu philosophy including Advaita, Vishishtadvaita, and Dvaita.",
      traditions: ["vedanta", "advaita-vedanta"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Brahma Sutras",
      type: "book",
      url: "https://bookshop.org/p/books/brahma-sutra-bhasya-of-shankaracharya-swami-gambhirananda/12529836",
      author: "Badarayana / Shankara (commentary)",
      year: null,
      description:
        "The foundational systematic text of Vedanta philosophy with Shankara's influential Advaita commentary.",
      traditions: ["vedanta", "advaita-vedanta"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Vedanta Society",
      type: "website",
      url: "https://www.vedantasociety.org",
      author: null,
      year: null,
      description:
        "Online home of the Vedanta Society of New York, with free texts, lectures, and resources on Vedantic philosophy and practice.",
      traditions: ["vedanta", "advaita-vedanta", "bhakti"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  bhakti: [
    {
      title: "Bhakti Movement (Encyclopaedia Britannica)",
      type: "article",
      url: "https://www.britannica.com/topic/bhakti",
      author: null,
      year: null,
      description:
        "Encyclopaedia Britannica overview of the bhakti devotional movement in Hinduism, its history, saints, and impact.",
      traditions: ["bhakti"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Songs of the Saints of India",
      type: "book",
      url: "https://bookshop.org/p/books/songs-of-the-saints-of-india-john-stratton-hawley/8613396",
      author: "John Stratton Hawley & Mark Juergensmeyer",
      year: 1988,
      description:
        "Translations of devotional poetry from six major North Indian bhakti saints including Mirabai, Kabir, and Ravidas.",
      traditions: ["bhakti"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Narada Bhakti Sutras",
      type: "book",
      url: "https://bookshop.org/p/books/narada-bhakti-sutras-swami-tyagisananda/17345082",
      author: "Narada",
      year: null,
      description:
        "Classic aphorisms on devotional love attributed to the sage Narada, one of the foundational texts of bhakti philosophy.",
      traditions: ["bhakti"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  "christian-mysticism": [
    {
      title: "Mysticism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/mysticism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on mysticism with significant coverage of the Christian contemplative tradition.",
      traditions: ["christian-mysticism", "hesychasm"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Christian Classics Ethereal Library",
      type: "website",
      url: "https://www.ccel.org",
      author: null,
      year: null,
      description:
        "Free digital library of classic Christian texts including works by Meister Eckhart, John of the Cross, Teresa of Avila, and the Desert Fathers.",
      traditions: ["christian-mysticism", "hesychasm"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Dark Night of the Soul",
      type: "book",
      url: "https://bookshop.org/p/books/dark-night-of-the-soul-st-john-of-the-cross/6661424",
      author: "St. John of the Cross",
      year: 1584,
      description:
        "Classic mystical treatise describing the soul's journey through spiritual desolation toward union with God.",
      traditions: ["christian-mysticism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Meister Eckhart: Selected Writings",
      type: "book",
      url: "https://bookshop.org/p/books/meister-eckhart-selected-writings-meister-eckhart/8652804",
      author: "Meister Eckhart",
      year: 1300,
      description:
        "Penguin Classics selection of the radical German mystic's sermons and treatises on detachment, divine unity, and the birth of God in the soul.",
      traditions: ["christian-mysticism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  hesychasm: [
    {
      title: "Hesychasm (Orthodox Wiki)",
      type: "website",
      url: "https://orthodoxwiki.org/Hesychasm",
      author: null,
      year: null,
      description:
        "Detailed overview of the Eastern Orthodox contemplative tradition of hesychasm, the Jesus Prayer, and inner stillness.",
      traditions: ["hesychasm"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "On the Prayer of Jesus",
      type: "book",
      url: "https://bookshop.org/p/books/on-the-prayer-of-jesus-ignatius-brianchaninov/12564688",
      author: "Ignatius Brianchaninov",
      year: 1867,
      description:
        "Classic guide to the Jesus Prayer practice and hesychast tradition by the 19th-century Russian bishop and spiritual writer.",
      traditions: ["hesychasm", "christian-mysticism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Gregory Palamas (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/palamas/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Gregory Palamas, the theologian who systematized hesychast theology and the distinction between God's essence and energies.",
      traditions: ["hesychasm"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
  ],
  taoism: [
    {
      title: "Taoism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/taoism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Taoist philosophy, its key texts, and its development from Laozi and Zhuangzi to religious Taoism.",
      traditions: ["taoism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Zhuangzi: The Complete Writings",
      type: "book",
      url: "https://bookshop.org/p/books/zhuangzi-the-complete-writings-brook-ziporyn/15959596",
      author: "Brook Ziporyn (trans.)",
      year: 2020,
      description:
        "Complete translation of the Zhuangzi, the foundational Taoist text known for its parables, humor, and radical philosophical vision.",
      traditions: ["taoism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Sacred Texts: Taoism",
      type: "website",
      url: "https://sacred-texts.com/tao/index.htm",
      author: null,
      year: null,
      description:
        "Free online collection of Taoist texts including the Tao Te Ching, Zhuangzi, and other classic works.",
      traditions: ["taoism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "The Secret of the Golden Flower",
      type: "book",
      url: "https://bookshop.org/p/books/the-secret-of-the-golden-flower-thomas-cleary/6670310",
      author: "Thomas Cleary (trans.)",
      year: 1991,
      description:
        "Classic Chinese Taoist meditation manual on inner alchemy and the cultivation of the light of consciousness.",
      traditions: ["taoism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  "classical-yoga": [
    {
      title: "Yoga (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/yoga/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the philosophy of yoga including Patanjali's system, its metaphysics, and its relationship to other Indian schools.",
      traditions: ["classical-yoga"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Hatha Yoga Pradipika",
      type: "book",
      url: "https://bookshop.org/p/books/hatha-yoga-pradipika-swami-muktibodhananda/12544368",
      author: "Swatmarama / Swami Muktibodhananda (commentary)",
      year: 1350,
      description:
        "The classic 15th-century manual of hatha yoga practice covering asana, pranayama, mudra, and samadhi.",
      traditions: ["classical-yoga"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Sacred Texts: Yoga",
      type: "website",
      url: "https://sacred-texts.com/hin/yoga/index.htm",
      author: null,
      year: null,
      description:
        "Free online collection of classic yoga texts including the Yoga Sutras, Hatha Yoga Pradipika, and related works.",
      traditions: ["classical-yoga"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  kabbalah: [
    {
      title: "Kabbalah (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/kabbalah/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the Jewish mystical tradition of Kabbalah, covering its history, key concepts, and major texts.",
      traditions: ["kabbalah"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Sefer Yetzirah (Book of Formation)",
      type: "book",
      url: "https://bookshop.org/p/books/sefer-yetzirah-the-book-of-creation-aryeh-kaplan/8564928",
      author: "Aryeh Kaplan (trans.)",
      year: 1990,
      description:
        "Translation and commentary on the earliest extant Kabbalistic text, describing creation through the Hebrew letters and sefirot.",
      traditions: ["kabbalah"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Sefaria",
      type: "website",
      url: "https://www.sefaria.org",
      author: null,
      year: null,
      description:
        "Free online library of Jewish texts including the Torah, Talmud, Zohar, and Kabbalistic works with translations and commentary.",
      traditions: ["kabbalah"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  gnosticism: [
    {
      title: "Gnosticism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/gnosticism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Gnostic religious movements, their cosmology, texts, and relationship to early Christianity.",
      traditions: ["gnosticism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Nag Hammadi Scriptures",
      type: "book",
      url: "https://bookshop.org/p/books/the-nag-hammadi-scriptures-marvin-w-meyer/8208780",
      author: "Marvin W. Meyer (ed.)",
      year: 2007,
      description:
        "Definitive English translation of the complete Nag Hammadi library — the major collection of Gnostic texts discovered in Egypt in 1945.",
      traditions: ["gnosticism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "The Gnostic Society Library",
      type: "website",
      url: "http://www.gnosis.org/library.html",
      author: null,
      year: null,
      description:
        "Free archive of Gnostic texts including Nag Hammadi translations, Valentinian writings, and encyclopedic articles on Gnostic traditions.",
      traditions: ["gnosticism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  neoplatonism: [
    {
      title: "Neoplatonism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/neoplatonism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the Neoplatonic philosophical tradition from Plotinus through Proclus and its lasting influence.",
      traditions: ["neoplatonism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Enneads (Penguin Classics)",
      type: "book",
      url: "https://bookshop.org/p/books/the-enneads-plotinus/16562976",
      author: "Plotinus / Stephen MacKenna (trans.)",
      year: 1991,
      description:
        "Plotinus's collected philosophical writings organized by his student Porphyry — the foundational texts of Neoplatonic philosophy.",
      traditions: ["neoplatonism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Encyclopaedia Britannica: Neoplatonism",
      type: "article",
      url: "https://www.britannica.com/topic/Neoplatonism",
      author: null,
      year: null,
      description:
        "Comprehensive overview of the Neoplatonic philosophical system, its origins in Plotinus, and its influence on Christian, Islamic, and Jewish mysticism.",
      traditions: ["neoplatonism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
  ],
  jainism: [
    {
      title: "Jainism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/jainism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Jain philosophy, ethics of non-violence, and contemplative practices.",
      traditions: ["jainism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Tattvartha Sutra (That Which Is)",
      type: "book",
      url: "https://bookshop.org/p/books/tattvartha-sutra-that-which-is-umasvati/18752866",
      author: "Umasvati / Nathmal Tatia (trans.)",
      year: 2011,
      description:
        "The only text accepted by all major Jain sects, systematizing Jain philosophy — reality, karma, liberation, and ethics.",
      traditions: ["jainism"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Encyclopaedia Britannica: Jainism",
      type: "article",
      url: "https://www.britannica.com/topic/Jainism",
      author: null,
      year: null,
      description:
        "Comprehensive overview of Jain religion, philosophy, history, and contemplative practices.",
      traditions: ["jainism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
  ],
  "kashmir-shaivism": [
    {
      title: "Kashmir Shaivism (Internet Encyclopedia of Philosophy)",
      type: "article",
      url: "https://iep.utm.edu/kashmiri-shaivism/",
      author: null,
      year: null,
      description:
        "Encyclopedia entry on the non-dual Shaiva philosophical tradition of Kashmir, covering recognition philosophy, vibration doctrine, and practice.",
      traditions: ["kashmir-shaivism"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Recognition Sutras (Pratyabhijna Hridayam)",
      type: "book",
      url: "https://bookshop.org/p/books/the-recognition-sutras-illuminating-a-1-000-year-old-spiritual-masterpiece-christopher-wallis/9649816",
      author: "Christopher Wallis",
      year: 2017,
      description:
        "Accessible translation and commentary on Kshemaraja's Heart of Recognition — a key text of Kashmir Shaivism's recognition philosophy.",
      traditions: ["kashmir-shaivism", "tantra"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Vijnana Bhairava Tantra",
      type: "book",
      url: "https://bookshop.org/p/books/the-radiance-sutras-lorin-roche/10454830",
      author: "Lorin Roche (trans.)",
      year: 2014,
      description:
        "The Radiance Sutras — poetic rendering of the Vijnana Bhairava Tantra, describing 112 meditation techniques in the Shaiva tradition.",
      traditions: ["kashmir-shaivism", "tantra"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  tantra: [
    {
      title: "Tantra (Encyclopaedia Britannica)",
      type: "article",
      url: "https://www.britannica.com/topic/Tantra",
      author: null,
      year: null,
      description:
        "Overview of Tantric traditions across Hinduism and Buddhism, covering philosophy, practice, and historical development.",
      traditions: ["tantra", "kashmir-shaivism", "vajrayana"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Kularnava Tantra",
      type: "book",
      url: "https://bookshop.org/p/books/kularnava-tantra-arthur-avalon/18753456",
      author: "Arthur Avalon (trans.)",
      year: 1965,
      description:
        "One of the most important texts of the Kaula school of tantra, covering initiation, practice, mantra, and the guru-disciple relationship.",
      traditions: ["tantra"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "The Serpent Power",
      type: "book",
      url: "https://bookshop.org/p/books/the-serpent-power-sir-john-woodroffe/6714572",
      author: "Sir John Woodroffe (Arthur Avalon)",
      year: 1919,
      description:
        "Pioneering English-language study of kundalini and chakra systems, translating and commenting on the Sat-Cakra-Nirupana and Paduka-Pancaka.",
      traditions: ["tantra", "classical-yoga"],
      teachers: [],
      centers: [],
      category: "academic",
    },
  ],
  mahayana: [
    {
      title: "Mahayana Buddhism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/buddhism-mahayana/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Mahayana Buddhist philosophy including emptiness, Buddha-nature, and the bodhisattva ideal.",
      traditions: ["mahayana"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Heart Sutra",
      type: "book",
      url: "https://bookshop.org/p/books/the-heart-sutra-a-comprehensive-guide-to-the-classic-of-mahayana-buddhism-kazuaki-tanahashi/8202224",
      author: "Kazuaki Tanahashi",
      year: 2014,
      description:
        "Comprehensive guide to the most chanted text in Mahayana Buddhism, with historical context, multiple translations, and commentary.",
      traditions: ["mahayana", "zen"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "BDK Tripitaka Digital Archives",
      type: "website",
      url: "https://www.bdkamerica.org/tripitaka/",
      author: null,
      year: null,
      description:
        "Free digital collection of Mahayana Buddhist texts translated into English by the Bukkyō Dendō Kyōkai (Society for the Promotion of Buddhism).",
      traditions: ["mahayana"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  vajrayana: [
    {
      title: "Vajrayana (Encyclopaedia Britannica)",
      type: "article",
      url: "https://www.britannica.com/topic/Vajrayana",
      author: null,
      year: null,
      description:
        "Overview of Vajrayana (tantric) Buddhism including its origins, key practices, and philosophical foundations.",
      traditions: ["vajrayana"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Lotsawa House",
      type: "website",
      url: "https://www.lotsawahouse.org",
      author: null,
      year: null,
      description:
        "Free library of Tibetan Buddhist texts and translations covering all schools — prayers, practice texts, philosophical works, and biographies.",
      traditions: ["vajrayana", "tibetan-buddhism-gelug", "dzogchen"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Introduction to Tantra: The Transformation of Desire",
      type: "book",
      url: "https://bookshop.org/p/books/introduction-to-tantra-the-transformation-of-desire-lama-thubten-yeshe/6671926",
      author: "Lama Thubten Yeshe",
      year: 1987,
      description:
        "Accessible introduction to Buddhist tantra by one of the first Tibetan lamas to teach Westerners, covering view, motivation, and practice.",
      traditions: ["vajrayana", "tibetan-buddhism-gelug"],
      teachers: [],
      centers: [],
      category: "popular",
    },
  ],
  "tibetan-buddhism-gelug": [
    {
      title: "Tibetan Buddhism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/tibetan-buddhism/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Tibetan Buddhist philosophy covering the four major schools, their doctrines, and contemplative methods.",
      traditions: ["tibetan-buddhism-gelug", "vajrayana", "dzogchen"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Great Treatise on the Stages of the Path to Enlightenment (Lamrim Chenmo)",
      type: "book",
      url: "https://bookshop.org/p/books/the-great-treatise-on-the-stages-of-the-path-to-enlightenment-volume-1-tsong-kha-pa/8201410",
      author: "Tsongkhapa",
      year: 1402,
      description:
        "Tsongkhapa's comprehensive guide to Buddhist practice — the foundational text of the Gelug school, covering the entire path from beginner to enlightenment.",
      traditions: ["tibetan-buddhism-gelug"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Treasury of Dharma (FPMT)",
      type: "website",
      url: "https://fpmt.org/education/teachings/",
      author: null,
      year: null,
      description:
        "Free teachings, study programs, and practice materials from the Foundation for the Preservation of the Mahayana Tradition, a major Gelug organization.",
      traditions: ["tibetan-buddhism-gelug"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  dzogchen: [
    {
      title: "Dzogchen (Rigpa Wiki)",
      type: "website",
      url: "https://www.rigpawiki.org/index.php?title=Dzogchen",
      author: null,
      year: null,
      description:
        "Detailed wiki article on the Great Perfection tradition of Tibetan Buddhism, covering view, meditation, and lineage history.",
      traditions: ["dzogchen"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "The Flight of the Garuda",
      type: "book",
      url: "https://bookshop.org/p/books/the-flight-of-the-garuda-the-dzogchen-tradition-of-tibetan-buddhism-keith-dowman/8201098",
      author: "Keith Dowman (trans.)",
      year: 2003,
      description:
        "Collection of Dzogchen meditation instructions from the treasure (terma) tradition, emphasizing direct recognition of the nature of mind.",
      traditions: ["dzogchen", "vajrayana"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Self-Liberation Through Seeing with Naked Awareness",
      type: "book",
      url: "https://bookshop.org/p/books/self-liberation-through-seeing-with-naked-awareness-john-myrdhin-reynolds/12533698",
      author: "Padmasambhava / John Reynolds (trans.)",
      year: 2000,
      description:
        "Translation and commentary on a key Dzogchen terma text attributed to Padmasambhava on recognizing awareness in its naked state.",
      traditions: ["dzogchen"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  "chan-buddhism": [
    {
      title: "Chan Buddhism (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/buddhism-chan/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on Chinese Chan Buddhism, covering its origins, key figures, and philosophical contributions.",
      traditions: ["chan-buddhism", "zen"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "The Sayings of Layman Pang",
      type: "book",
      url: "https://bookshop.org/p/books/the-sayings-of-layman-p-ang-a-zen-classic-of-china-james-green/8201476",
      author: "James Green (trans.)",
      year: 2009,
      description:
        "Dialogues and verses of the legendary Tang dynasty lay Chan practitioner, showcasing the radical simplicity of awakened life.",
      traditions: ["chan-buddhism", "zen"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Chan Buddhism (Buddhistdoor Global)",
      type: "website",
      url: "https://www.buddhistdoor.net/features/category/chan-buddhism",
      author: null,
      year: null,
      description:
        "Articles and features on Chan Buddhist practice, philosophy, and contemporary relevance from an international Buddhist media platform.",
      traditions: ["chan-buddhism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  "early-buddhism": [
    {
      title: "Buddha (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/buddha/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the historical Buddha and the core philosophical teachings of early Buddhism.",
      traditions: ["early-buddhism", "theravada"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "In the Buddha's Words: An Anthology of Discourses from the Pali Canon",
      type: "book",
      url: "https://bookshop.org/p/books/in-the-buddha-s-words-an-anthology-of-discourses-from-the-pali-canon-bhikkhu-bodhi/6672052",
      author: "Bhikkhu Bodhi",
      year: 2005,
      description:
        "Thematic anthology of the Buddha's discourses organized to guide readers through the essential teachings of early Buddhism.",
      traditions: ["early-buddhism", "theravada"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
    {
      title: "Pali Text Society",
      type: "website",
      url: "https://www.palitext.com",
      author: null,
      year: null,
      description:
        "Publisher and archive of Pali Canon texts, translations, and scholarly works on early Buddhism since 1881.",
      traditions: ["early-buddhism", "theravada"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  "vipassana-movement": [
    {
      title: "Vipassana Research Institute",
      type: "website",
      url: "https://www.vridhamma.org",
      author: null,
      year: null,
      description:
        "Official resource for S.N. Goenka's vipassana meditation tradition, with access to discourses, course schedules, and Pali text research.",
      traditions: ["vipassana-movement", "theravada"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "The Art of Living: Vipassana Meditation",
      type: "book",
      url: "https://bookshop.org/p/books/the-art-of-living-vipassana-meditation-as-taught-by-s-n-goenka-william-hart/6672126",
      author: "William Hart / S.N. Goenka",
      year: 1987,
      description:
        "The definitive introduction to Goenka's vipassana method, covering the theory, technique, and practical application of insight meditation.",
      traditions: ["vipassana-movement", "theravada"],
      teachers: [],
      centers: [],
      category: "popular",
    },
    {
      title: "Manual of Insight",
      type: "book",
      url: "https://bookshop.org/p/books/manual-of-insight-mahasi-sayadaw/10477032",
      author: "Mahasi Sayadaw",
      year: 2016,
      description:
        "Comprehensive meditation manual from one of the most influential Burmese vipassana teachers of the 20th century.",
      traditions: ["vipassana-movement", "theravada"],
      teachers: [],
      centers: [],
      category: "primary_text",
    },
  ],
  "secular-mindfulness": [
    {
      title: "Mindfulness (Psychology Today)",
      type: "website",
      url: "https://www.psychologytoday.com/us/basics/mindfulness",
      author: null,
      year: null,
      description:
        "Overview of secular mindfulness from a psychological perspective, covering research, techniques, and clinical applications.",
      traditions: ["secular-mindfulness"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "The Mind Illuminated",
      type: "book",
      url: "https://bookshop.org/p/books/the-mind-illuminated-a-complete-meditation-guide-integrating-buddhist-wisdom-and-brain-science-for-greater-mindfulness-culadasa-john-yates/7207620",
      author: "Culadasa (John Yates)",
      year: 2015,
      description:
        "Systematic meditation manual bridging traditional Buddhist contemplative practice with cognitive science and secular accessibility.",
      traditions: ["secular-mindfulness", "theravada"],
      teachers: [],
      centers: [],
      category: "popular",
    },
    {
      title: "Greater Good Science Center: Mindfulness",
      type: "website",
      url: "https://greatergood.berkeley.edu/topic/mindfulness",
      author: null,
      year: null,
      description:
        "UC Berkeley research center publishing accessible articles on the science of mindfulness, meditation research, and practical applications.",
      traditions: ["secular-mindfulness"],
      teachers: [],
      centers: [],
      category: "academic",
    },
  ],
  "modern-non-dual": [
    {
      title: "Non-Dual Awareness (Science and Nonduality)",
      type: "website",
      url: "https://www.scienceandnonduality.com",
      author: null,
      year: null,
      description:
        "Conference and media platform exploring non-dual awareness through the intersection of science, philosophy, and contemplative traditions.",
      traditions: ["modern-non-dual", "advaita-vedanta"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "The Transparency of Things",
      type: "book",
      url: "https://bookshop.org/p/books/the-transparency-of-things-contemplating-the-nature-of-experience-rupert-spira/10454734",
      author: "Rupert Spira",
      year: 2008,
      description:
        "Contemporary exploration of non-dual awareness through contemplation and direct investigation of ordinary experience.",
      traditions: ["modern-non-dual", "advaita-vedanta"],
      teachers: [],
      centers: [],
      category: "popular",
    },
    {
      title: "Open Awareness, Open Mind",
      type: "book",
      url: "https://bookshop.org/p/books/open-awareness-open-mind-finding-lasting-peace-with-the-practice-of-meditation-pema-chodron/17208344",
      author: "Georgiann Voissem",
      year: 2023,
      description:
        "Accessible guide to non-dual meditation integrating insights from Advaita Vedanta, Zen, and Dzogchen traditions.",
      traditions: ["modern-non-dual"],
      teachers: [],
      centers: [],
      category: "popular",
    },
  ],
  "quaker-inner-light": [
    {
      title: "Quakers (Stanford Encyclopedia of Philosophy)",
      type: "article",
      url: "https://plato.stanford.edu/entries/quakers/",
      author: null,
      year: null,
      description:
        "Stanford Encyclopedia entry on the Religious Society of Friends, covering the Inner Light doctrine, silent worship, and Quaker philosophy.",
      traditions: ["quaker-inner-light"],
      teachers: [],
      centers: [],
      category: "encyclopedia",
    },
    {
      title: "Quaker Heritage Press",
      type: "website",
      url: "https://www.qhpress.org",
      author: null,
      year: null,
      description:
        "Free digital archive of classic Quaker texts including journals, epistles, and theological works from the 17th century onward.",
      traditions: ["quaker-inner-light"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
    {
      title: "Pendle Hill Pamphlets",
      type: "website",
      url: "https://pendlehill.org/product-category/pamphlets/",
      author: null,
      year: null,
      description:
        "Long-running series of short essays on Quaker spirituality, contemplative practice, and social witness from the Pendle Hill retreat center.",
      traditions: ["quaker-inner-light"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
  "tai-chi-qigong": [
    {
      title: "Tai Chi (National Center for Complementary and Integrative Health)",
      type: "website",
      url: "https://www.nccih.nih.gov/health/tai-chi-and-qi-gong-in-depth",
      author: null,
      year: null,
      description:
        "NIH overview of tai chi and qigong research, health benefits, and practice considerations.",
      traditions: ["tai-chi-qigong"],
      teachers: [],
      centers: [],
      category: "academic",
    },
    {
      title: "The Harvard Medical School Guide to Tai Chi",
      type: "book",
      url: "https://bookshop.org/p/books/the-harvard-medical-school-guide-to-tai-chi-peter-wayne/6662828",
      author: "Peter Wayne",
      year: 2013,
      description:
        "Evidence-based guide to tai chi's health benefits, integrating traditional wisdom with modern medical research.",
      traditions: ["tai-chi-qigong"],
      teachers: [],
      centers: [],
      category: "academic",
    },
    {
      title: "Energy Arts",
      type: "website",
      url: "https://www.energyarts.com",
      author: null,
      year: null,
      description:
        "Comprehensive resource for tai chi, qigong, and Taoist meditation instruction from lineage holder Bruce Frantzis.",
      traditions: ["tai-chi-qigong", "taoism"],
      teachers: [],
      centers: [],
      category: "web_resource",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, "..");
const RESOURCES_DIR = path.join(ROOT, "data", "resources");
const TRADITIONS_DIR = path.join(ROOT, "data", "traditions");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function loadExistingResources(): Map<string, { slug: string; title: string; url: string }> {
  const map = new Map<string, { slug: string; title: string; url: string }>();
  const files = fs.readdirSync(RESOURCES_DIR).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(RESOURCES_DIR, file), "utf-8"));
    map.set(data.slug, { slug: data.slug, title: data.title, url: data.url });
  }
  return map;
}

function loadTraditionSlugs(): string[] {
  return fs
    .readdirSync(TRADITIONS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const traditionIdx = args.indexOf("--tradition");
  const singleTradition = traditionIdx !== -1 ? args[traditionIdx + 1] : null;

  const existingResources = loadExistingResources();
  const traditionSlugs = loadTraditionSlugs();

  // Build URL index for dedup
  const existingUrls = new Set<string>();
  for (const r of existingResources.values()) {
    existingUrls.add(r.url);
  }
  // Also track titles (lowercased) for dedup
  const existingTitles = new Set<string>();
  for (const r of existingResources.values()) {
    existingTitles.add(r.title.toLowerCase());
  }

  const targetTraditions = singleTradition ? [singleTradition] : traditionSlugs;

  // Validate requested traditions exist
  for (const t of targetTraditions) {
    if (!traditionSlugs.includes(t)) {
      console.error(`ERROR: Tradition "${t}" not found in ${TRADITIONS_DIR}`);
      process.exit(1);
    }
  }

  let totalWritten = 0;
  let totalSkipped = 0;
  const writtenSlugs = new Set<string>();

  for (const tradition of targetTraditions) {
    const sources = SOURCES_DB[tradition];
    if (!sources || sources.length === 0) {
      console.log(`[${tradition}] No curated sources in knowledge base — skipping`);
      continue;
    }

    console.log(`\n[${tradition}] Processing ${sources.length} candidate sources...`);

    let written = 0;
    for (const source of sources) {
      const slug = slugify(source.title);

      // Dedup: skip if slug, URL, or title already exists
      if (existingResources.has(slug) || writtenSlugs.has(slug)) {
        console.log(`  SKIP (exists): ${source.title}`);
        totalSkipped++;
        continue;
      }
      if (existingUrls.has(source.url)) {
        console.log(`  SKIP (URL exists): ${source.title}`);
        totalSkipped++;
        continue;
      }
      if (existingTitles.has(source.title.toLowerCase())) {
        console.log(`  SKIP (title exists): ${source.title}`);
        totalSkipped++;
        continue;
      }

      // Validate that all referenced traditions actually exist
      const validTraditions = source.traditions.filter((t) => traditionSlugs.includes(t));

      const resource: ResourceFile = {
        ...source,
        slug,
        traditions: validTraditions,
      };

      const filePath = path.join(RESOURCES_DIR, `${slug}.json`);

      if (dryRun) {
        console.log(`  DRY-RUN would write: ${filePath}`);
        console.log(`    Title: ${resource.title}`);
        console.log(`    Category: ${resource.category}`);
        console.log(`    Type: ${resource.type}`);
        console.log(`    Traditions: ${resource.traditions.join(", ")}`);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(resource, null, 2) + "\n");
        console.log(`  WROTE: ${path.basename(filePath)} — ${resource.title}`);
      }

      // Track for dedup across traditions
      writtenSlugs.add(slug);
      existingUrls.add(source.url);
      existingTitles.add(source.title.toLowerCase());
      written++;
      totalWritten++;
    }

    console.log(`  [${tradition}] ${written} new sources${dryRun ? " (dry-run)" : " written"}`);
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total new resources: ${totalWritten}${dryRun ? " (dry-run, nothing written)" : ""}`);
  console.log(`Total skipped (duplicates): ${totalSkipped}`);
  console.log(`Traditions processed: ${targetTraditions.length}`);
}

main();
