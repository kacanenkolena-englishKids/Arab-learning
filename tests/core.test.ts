import { test } from "node:test";
import assert from "node:assert/strict";
import {
  schedule,
  isAnswer,
  completeLesson,
  emptyProgress,
} from "../lib/progress.ts";
import { lessons, words, letters, dialogues } from "../lib/course.ts";
test("all twelve lessons contain valid vocabulary and teaching material", () => {
  assert.equal(lessons.length, 12);
  for (const l of lessons) {
    assert.ok(l.explanation.length > 50);
    assert.ok(l.indices.length >= 5);
    assert.ok(l.indices.every((i) => words[i]));
  }
});
test("alphabet has all 28 unique letters and connected forms", () => {
  assert.equal(letters.length, 28);
  assert.equal(new Set(letters.map((l) => l.ar)).size, 28);
  assert.ok(
    letters.every((l) => l.initial && l.medial && l.final && l.example),
  );
});
test("review schedules are deterministic and reset failed words", () => {
  const now = 100000;
  assert.equal(schedule(undefined, 0, now).due, now + 600000);
  assert.equal(schedule(undefined, 1, now).interval, 1);
  assert.equal(schedule({ interval: 4, due: 0, reps: 2 }, 2, now).interval, 8);
  assert.equal(schedule(undefined, 3, now).interval, 4);
});
test("answer normalization accepts specified variants only", () => {
  assert.ok(isAnswer(" أَنَا؟ ", ["انا"]));
  assert.ok(!isAnswer("قهوة", ["موية"]));
  assert.ok(!isAnswer("", ["روسيا"]));
});
test("dialogues have real speakers, translations and pronunciation support", () => {
  assert.equal(dialogues.length, 14);
  assert.ok(
    dialogues.every(
      (d) =>
        d.lines.length >= 3 &&
        d.lines.every((l) => l.ar && l.tr && l.ru && l.speaker),
    ),
  );
  assert.ok(words.every((w) => w.verification === "needs-native-review"));
});

test("completion adds learned words without overwriting review intervals", () => {
  const p = {
    ...emptyProgress,
    reviews: { w0: { due: 999999, interval: 4, reps: 2 } },
  };
  const result = completeLesson(p, 1, ["w0", "w1"], 100000);
  assert.deepEqual(result.reviews.w0, p.reviews.w0);
  assert.equal(result.reviews.w1.due, 100000);
  assert.deepEqual(completeLesson(result, 1, [], 100001).completed, [1]);
});
