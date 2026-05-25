import { IC } from "../icons.js";
import { state, setState } from "../store.js";

const headerActions = document.getElementById("headerActions");

export function renderHeader() {
  if (state.screen === "done") {
    headerActions.innerHTML = `
      <button class="btn btn-secondary" id="btnDownload">${IC.download} MD 다운로드</button>
      <button class="btn btn-ghost"     id="btnReset">${IC.refreshCw} 새 파일 분석</button>
    `;
    document.getElementById("btnDownload").addEventListener("click", downloadMd);
    document.getElementById("btnReset").addEventListener("click", reset);
  } else {
    headerActions.innerHTML = "";
  }
}

function downloadMd() {
  const { uploadResult, report } = state;
  if (!report) return;
  const blob = new Blob([report.report_md], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${uploadResult.filename.replace(/\.csv$/, "")}-report.md`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function reset() {
  setState({ screen: "idle", file: null, uploadResult: null, report: null, step: "upload", error: null });
  window.scrollTo({ top: 0 });
}
