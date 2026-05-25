import { state, subscribe } from "./store.js";
import { renderHeader } from "./components/header.js";
import { renderUpload } from "./components/upload.js";
import { renderAnalyzing } from "./components/analyzing.js";
import { renderReport } from "./components/report.js";

const pageHeader = document.getElementById("pageHeader");

// 스크롤 인터랙션
window.addEventListener("scroll", () => {
  pageHeader.classList.toggle("is-scrolled", window.scrollY > 4);
}, { passive: true });

// 통합 렌더러 라우터
function render() {
  renderHeader();
  if (state.screen === "idle" || state.screen === "ready") {
    renderUpload();
  } else if (state.screen === "analyzing") {
    renderAnalyzing();
  } else if (state.screen === "done") {
    renderReport();
  }
}

// 상태 구독
subscribe(render);

// 최초 실행
render();
