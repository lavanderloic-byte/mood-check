import test from "node:test";
import assert from "node:assert/strict";
import { scoreAnswers } from "./app.js";

test("PHQ-9 standard score bands", () => {
  for (const [score, level] of [[0,"极轻微或没有"],[4,"极轻微或没有"],[5,"轻度"],[9,"轻度"],[10,"中度"],[14,"中度"],[15,"中重度"],[19,"中重度"],[20,"重度"],[27,"重度"]]) {
    const answers = Array(9).fill(0);
    for (let i = 0, remaining = score; i < 9; i++) {
      answers[i] = Math.min(3, remaining);
      remaining -= answers[i];
    }
    const result = scoreAnswers(answers);
    assert.equal(result.score, score);
    assert.equal(result.level, level);
    assert.equal(result.seekAssessment, score >= 10);
  }
});

test("any response above zero to item 9 raises safety flag regardless of total", () => {
  assert.equal(scoreAnswers([0,0,0,0,0,0,0,0,1]).selfHarmFlag, true);
  assert.equal(scoreAnswers([3,3,3,3,3,3,3,3,0]).selfHarmFlag, false);
});

test("incomplete or invalid answers are rejected", () => {
  assert.throws(() => scoreAnswers(Array(8).fill(0)));
  assert.throws(() => scoreAnswers([0,0,0,0,0,0,0,0,4]));
});
