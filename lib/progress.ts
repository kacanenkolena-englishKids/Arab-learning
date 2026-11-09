export type Review = { interval: number; due: number; reps: number };
export type Progress = {
  completed: number[];
  favorites: string[];
  reviews: Record<string, Review>;
  mistakes: string[];
  started: boolean;
  daily: Record<string, number>;
};
export const emptyProgress: Progress = {
  completed: [],
  favorites: [],
  reviews: {},
  mistakes: [],
  started: false,
  daily: {},
};
export function schedule(
  previous: Review | undefined,
  rating: number,
  now = Date.now(),
): Review {
  const interval =
    rating === 0
      ? 0
      : rating === 1
        ? 1
        : rating === 2
          ? Math.max(2, (previous?.interval || 1) * 2)
          : Math.max(4, (previous?.interval || 1) * 3);
  return {
    interval,
    due: now + (rating === 0 ? 10 * 60 * 1000 : interval * 86400000),
    reps: (previous?.reps || 0) + 1,
  };
}
export function loadProgress(): Progress {
  try {
    const v = JSON.parse(localStorage.getItem("riyadh-progress-v1") || "null");
    if (
      !v ||
      !Array.isArray(v.completed) ||
      !Array.isArray(v.favorites) ||
      !v.reviews ||
      typeof v.reviews !== "object" ||
      !Array.isArray(v.mistakes)
    )
      return structuredClone(emptyProgress);
    return { ...emptyProgress, ...v };
  } catch {
    return structuredClone(emptyProgress);
  }
}
export function saveProgress(p: Progress) {
  try {
    localStorage.setItem("riyadh-progress-v1", JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}
export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[؟?.,!،]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
export function isAnswer(input: string, variants: string[]) {
  return variants.some((v) => normalize(input) === normalize(v));
}
export function completeLesson(
  p: Progress,
  lessonId: number,
  wordIds: string[],
  now = Date.now(),
): Progress {
  const day = new Date(now).toLocaleDateString("sv");
  const reviews = { ...p.reviews };
  for (const id of wordIds)
    if (!reviews[id]) reviews[id] = { interval: 0, due: now, reps: 0 };
  return {
    ...p,
    completed: [...new Set([...p.completed, lessonId])],
    started: true,
    reviews,
    daily: { ...p.daily, [day]: (p.daily[day] || 0) + 1 },
  };
}
