import { IC } from "../icons.js";
import { state, setState } from "../store.js";
import { uploadFile, analyzeData } from "../api.js";

const pageMain = document.getElementById("pageMain");

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

export function renderUpload() {
  const { file, error } = state;

  pageMain.innerHTML = `
    <section class="upload">
      <div>
        <h1 class="upload-title">CSV 한 번에 분석합니다</h1>
        <p class="upload-subtitle">파일을 올리면 Gemini가 통계와 인사이트를 한국어로 정리해 드립니다.</p>
      </div>

      ${error ? `<div class="error-banner">${IC.alertCircle}<span>${error}</span></div>` : ""}

      ${file ? `
        <div class="file-card">
          <div class="file-card-icon">${IC.fileText}</div>
          <div class="file-card-meta">
            <div class="file-card-name">${file.name}</div>
            <div class="file-card-sub">${formatBytes(file.size)}</div>
          </div>
          <button class="file-card-remove" id="btnRemove">${IC.x}</button>
        </div>
        <div class="upload-actions">
          <button class="btn btn-primary btn-lg" id="btnStart">분석 시작</button>
        </div>
      ` : `
        <div class="dropzone" id="dropzone">
          <div class="dropzone-icon">${IC.uploadCloud}</div>
          <div class="dropzone-title">CSV 파일을 여기로 끌어다 놓으세요</div>
          <div class="dropzone-sub">또는 <span class="dropzone-link" id="dropzoneLink">파일 선택</span></div>
          <div class="dropzone-meta">.csv · 최대 50 MB · UTF-8, EUC-KR 자동 감지</div>
          <input type="file" id="filePick" class="file-pick-input" accept=".csv">
        </div>
        <div class="upload-samples">
          <span>샘플로 시작:</span>
          <button data-sample="sales_2025.csv" data-size="2457600">sales_2025.csv</button>
          <button data-sample="users_q1.csv"   data-size="812032">users_q1.csv</button>
          <button data-sample="traffic.csv"    data-size="5341184">traffic.csv</button>
        </div>
      `}
    </section>
  `;

  setupUploadEvents();
}

function setupUploadEvents() {
  if (state.file) {
    document.getElementById("btnRemove").addEventListener("click", () =>
      setState({ file: null, screen: "idle", error: null })
    );
    document.getElementById("btnStart").addEventListener("click", doStart);
    return;
  }

  const dropzone = document.getElementById("dropzone");
  const filePick = document.getElementById("filePick");

  document.getElementById("dropzoneLink").addEventListener("click", (e) => {
    e.stopPropagation();
    filePick.click();
  });
  dropzone.addEventListener("click", () => filePick.click());
  dropzone.addEventListener("dragover",  (e) => { e.preventDefault(); dropzone.classList.add("is-dragover"); });
  dropzone.addEventListener("dragleave", ()  => dropzone.classList.remove("is-dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  });

  filePick.addEventListener("change", () => {
    if (filePick.files[0]) pickFile(filePick.files[0]);
  });

  document.querySelectorAll("[data-sample]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setState({ file: { name: btn.dataset.sample, size: parseInt(btn.dataset.size), fake: true }, screen: "ready", error: null });
    });
  });
}

function pickFile(f) {
  if (!f.name.endsWith(".csv")) {
    setState({ error: "CSV 파일만 지원합니다.", screen: "idle" });
    return;
  }
  if (f.size > 50 * 1024 * 1024) {
    setState({ error: "파일 크기가 50MB를 초과합니다.", screen: "idle" });
    return;
  }
  setState({ file: f, screen: "ready", error: null });
}

async function doStart() {
  setState({ screen: "analyzing", step: "upload", error: null });

  try {
    let uploadResult;

    if (state.file.fake) {
      await new Promise((r) => setTimeout(r, 700));
      uploadResult = {
        filename: state.file.name,
        stats: {
          overview: { rows: 1000, columns: 5, missing_rate: 0.03, memory_mb: 0.5 },
          columns: {
            id:       { type: "numeric",     stats: { min: 1,    max: 1000, mean: 500.5, std: 288.7, missing: 0 } },
            name:     { type: "categorical", stats: { unique: 980, top: ["Alice", "Bob", "Charlie"], missing: 0 } },
            category: { type: "categorical", stats: { unique: 5,   top: ["A", "B", "C"], missing: 2 } },
            amount:   { type: "numeric",     stats: { min: 0, max: 9999, mean: 1234.5, std: 876.3, missing: 30 } },
            date:     { type: "datetime",    stats: { min: "2024-01-01 00:00:00", max: "2024-12-31 00:00:00", missing: 0 } },
          },
        },
      };
    } else {
      uploadResult = await uploadFile(state.file);
    }

    setState({ step: "compute", uploadResult });
    await new Promise((r) => setTimeout(r, 400));
    setState({ step: "insights" });

    const report = await analyzeData(uploadResult.filename, uploadResult.stats);

    await new Promise((r) => setTimeout(r, 300));
    setState({ screen: "done", report });
    window.scrollTo({ top: 0 });

  } catch (err) {
    setState({ screen: "ready", error: err.message });
  }
}
