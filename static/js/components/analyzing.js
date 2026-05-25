import { IC } from "../icons.js";
import { state } from "../store.js";

const pageMain = document.getElementById("pageMain");

export function renderAnalyzing() {
  const steps = [
    { id: "upload",   label: "업로드" },
    { id: "compute",  label: "통계 계산" },
    { id: "insights", label: "AI 분석" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === state.step);

  const stepsHtml = steps.map((s, i) => {
    const isDone   = i < currentIdx;
    const isActive = i === currentIdx;
    const dotCls   = isDone ? "done" : isActive ? "active" : "idle";
    const lblCls   = isDone ? "is-done" : isActive ? "is-active" : "";
    const dotInner = isDone ? IC.check : isActive ? `<span class="spinner-sm"></span>` : "";
    return `
      ${i > 0 ? `<span class="step-sep"></span>` : ""}
      <div class="step">
        <span class="step-dot ${dotCls}">${dotInner}</span>
        <span class="step-label ${lblCls}">${s.label}</span>
      </div>
    `;
  }).join("");

  pageMain.innerHTML = `
    <div class="analyzing">
      <div class="spinner-lg"></div>
      <div>
        <h2 class="analyzing-title">Gemini가 데이터를 분석하고 있습니다…</h2>
        <p class="analyzing-sub">${state.uploadResult?.filename ?? state.file?.name ?? ""}</p>
      </div>
      <div class="steps">${stepsHtml}</div>
    </div>
  `;
}
