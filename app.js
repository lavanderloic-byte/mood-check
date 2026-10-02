export const questions = [
  "做事时提不起劲或没有兴趣",
  "感到心情低落、沮丧或绝望",
  "入睡困难、睡不安稳，或睡眠过多",
  "感到疲倦或没有活力",
  "食欲不振或吃得过多",
  "觉得自己很糟、是个失败者，或让自己或家人失望",
  "阅读或看电视时难以集中注意力",
  "动作或说话变慢，明显到别人能察觉；或者相反，烦躁、坐立不安，比平常动得更多",
  "觉得不如死了好，或想到用某种方式伤害自己"
];

export const options = ["完全没有", "有几天", "一半以上的日子", "几乎每天"];

export function scoreAnswers(answers) {
  if (!Array.isArray(answers) || answers.length !== 9 || answers.some(value => !Number.isInteger(value) || value < 0 || value > 3)) {
    throw new Error("必须完成全部 9 题，每题选择 0–3 分。");
  }
  const score = answers.reduce((sum, value) => sum + value, 0);
  const level = score < 5 ? "极轻微或没有" : score < 10 ? "轻度" : score < 15 ? "中度" : score < 20 ? "中重度" : "重度";
  return { score, level, seekAssessment: score >= 10, selfHarmFlag: answers[8] > 0 };
}

if (typeof document !== "undefined") {
  const form = document.querySelector("#quiz");
  const container = document.querySelector("#questions");
  const result = document.querySelector("#result");
  const error = document.querySelector("#form-error");
  const progressLabel = document.querySelector("#progress-label");
  const progressBar = document.querySelector(".progress-track");
  const progressFill = document.querySelector("#progress-fill");

  questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question";
    fieldset.innerHTML = `<legend><span class="question-number">${String(index + 1).padStart(2, "0")} / 09</span>${question}</legend><div class="options">${options.map((option, value) => `<label class="option"><input type="radio" name="q${index}" value="${value}"><span>${option}</span></label>`).join("")}</div>`;
    container.append(fieldset);
  });

  function getAnswers() {
    return questions.map((_, index) => {
      const checked = form.querySelector(`input[name="q${index}"]:checked`);
      return checked ? Number(checked.value) : null;
    });
  }

  form.addEventListener("change", () => {
    const answers = getAnswers();
    const completed = answers.filter(value => value !== null).length;
    progressLabel.textContent = `已完成 ${completed} / 9`;
    progressBar.setAttribute("aria-valuenow", String(completed));
    progressFill.style.width = `${completed / 9 * 100}%`;
    if (completed === 9) error.hidden = true;
    if (!result.hidden) result.hidden = true;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const answers = getAnswers();
    const firstMissing = answers.indexOf(null);
    if (firstMissing !== -1) {
      error.hidden = false;
      container.querySelectorAll("fieldset")[firstMissing].querySelector("input").focus();
      return;
    }
    error.hidden = true;
    const assessment = scoreAnswers(answers);
    const guidance = assessment.seekAssessment
      ? "建议尽快联系医生或心理健康专业人员，讨论你的症状和下一步支持。"
      : "如果这些感受持续、加重或影响生活，即使分数不高，也值得找医生或心理健康专业人员聊聊。";
    result.innerHTML = `<span class="eyebrow">你的自评结果</span><h2>${assessment.level}抑郁症状</h2><div class="score-line"><span class="score">${assessment.score}</span><span class="score-max">/ 27 分</span></div><div class="result-callout"><p>${guidance}</p></div>${assessment.selfHarmFlag ? `<div class="urgent" role="alert"><strong>请优先关注自己的安全</strong><p>你选择了与自伤或轻生想法有关的选项。无论总分多少，都请尽快联系心理健康专业人员。如果此刻可能伤害自己，请立即联系当地急救服务，并请身边的人陪着你。</p></div>` : ""}<p>这个分数反映的是过去两周的症状频率，不能确诊，也不能排除抑郁症。身体疾病、压力和其他情况也可能影响感受。</p><button class="secondary-button" type="button" id="restart">重新填写</button>`;
    result.hidden = false;
    result.focus();
    result.scrollIntoView({ behavior: "smooth", block: "start" });
    result.querySelector("#restart").addEventListener("click", () => {
      form.reset();
      progressLabel.textContent = "已完成 0 / 9";
      progressBar.setAttribute("aria-valuenow", "0");
      progressFill.style.width = "0%";
      result.hidden = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
