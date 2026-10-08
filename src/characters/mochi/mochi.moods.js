// Daftar resmi mood Mochi (sumber tunggal).
// Dropdown mood, label jumlah mood, dan durasi animasi (preview & export)
// semuanya membaca dari file ini. Jangan tulis ulang daftar/angka ini di tempat lain.

// Durasi 1 putaran animasi (ms), mengikuti gerakan di MochiMaster:
// napas 3,6 detik, dancing 0,8 detik, tangan greeting 0,75 detik.
const FLOAT_MS = 3600;

export const mochiMoods = [
  { id: "idle", label: "Idle", durationMs: FLOAT_MS },
  { id: "working", label: "Working", durationMs: FLOAT_MS },
  { id: "thinking", label: "Thinking", durationMs: FLOAT_MS },
  { id: "searching", label: "Searching", durationMs: FLOAT_MS },
  { id: "approval", label: "Approval", durationMs: FLOAT_MS },
  { id: "question", label: "Question", durationMs: FLOAT_MS },
  { id: "error", label: "Error", durationMs: FLOAT_MS },
  { id: "finished", label: "Finished", durationMs: FLOAT_MS },
  { id: "rate_limit", label: "Rate Limit", durationMs: FLOAT_MS },
  { id: "sleeping", label: "Sleeping", durationMs: FLOAT_MS },
  { id: "dizzy", label: "Dizzy", durationMs: FLOAT_MS },
  { id: "greeting", label: "Greeting", durationMs: 750 },
  { id: "love", label: "Love", durationMs: FLOAT_MS },
  { id: "surprised", label: "Surprised", durationMs: FLOAT_MS },
  { id: "proud", label: "Proud", durationMs: FLOAT_MS },
  { id: "wink", label: "Wink", durationMs: FLOAT_MS },
  { id: "yawn", label: "Yawn", durationMs: FLOAT_MS },
  { id: "annoyed", label: "Annoyed", durationMs: FLOAT_MS },
  { id: "dancing", label: "Dancing", durationMs: 800 },
  { id: "beanie", label: "Beanie", durationMs: FLOAT_MS },
  { id: "santa_hat", label: "Santa Hat", durationMs: FLOAT_MS },
  { id: "glasses", label: "Glasses", durationMs: FLOAT_MS },
];

// Durasi 1 putaran untuk mood tertentu. Mood tak dikenal pakai durasi napas.
export function getMochiMoodDuration(moodId) {
  return mochiMoods.find((m) => m.id === moodId)?.durationMs ?? FLOAT_MS;
}
