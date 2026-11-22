const genres: Record<string, { path: string; en: string; zh: string; accent?: string }> = {
  衣: { en: "Fashion", zh: "时尚", path: "M8 3 3 6 1.5 10 5 12l2-2v11h10V10l2 2 3.5-2L21 6l-5-3c-1 4-7 4-8 0Z" },
  美: { en: "Beauty", zh: "美妆", path: "M8 21h8v-8H8z M9.5 13V6l5-3v10 M8 17h8" },
  食: { en: "Food", zh: "美食", path: "M4 3v5a3 3 0 0 0 6 0V3 M7 3v18 M19 21V3c-4 2-5 7-5 10h5" },
  住: { en: "Interiors", zh: "家居", path: "M6 12V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7 M5 12h14v4H5z M7 16l-1 5 M17 16l1 5" },
  遊: { en: "Culture", zh: "文化", path: "M9 17V6l11-3v12 M9 9l11-3 M9 17c0 4-7 5-7 2 0-3 7-5 7-2Z M20 15c0 4-7 5-7 2 0-3 7-5 7-2Z" },
  電: { en: "Gadgets", zh: "数码", path: "M3 7h4l2-3h6l2 3h4v13H3z", accent: "M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
  和: { en: "Japanese arts", zh: "日本传统文化", path: "M2 10q10-13 20 0l-10 10Z M6 7l6 13 6-13", accent: "M12 5v15" },
  古: { en: "Vintage", zh: "复古", path: "M5 7l13-5 M3 8h18v12H3z M6 12h6 M6 15h6 M18 14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" },
};

export function genreLabel(id: string, japanese: string, locale: "ja" | "en" | "zh") {
  return locale === "ja" ? japanese : genres[id]?.[locale] ?? japanese;
}

export function GenrePictogram({ id }: { id: string }) {
  return <svg className="passion-pict" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={genres[id]?.path} />{genres[id]?.accent && <path className="genre-accent-line" d={genres[id].accent} />}</svg>;
}
