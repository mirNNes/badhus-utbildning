const KEY = "badhus_training_progress_v1";

type Progress = { passed: Record<string, boolean> };

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Progress) : { passed: {} };
  } catch {
    return { passed: {} };
  }
}

function save(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markQuizPassed(moduleId: string) {
  const p = load();
  p.passed[moduleId] = true;
  save(p);
}

export function hasPassed(moduleId: string) {
  return !!load().passed[moduleId];
}
