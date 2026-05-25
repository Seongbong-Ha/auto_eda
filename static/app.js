// ─── Icons ───────────────────────────────────────────────────────────────────

const IC = {
  uploadCloud: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
  fileText:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  x:           `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check:       `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  download:    `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  refreshCw:   `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16.5"/></svg>`,
};

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  screen: "idle",       // 'idle' | 'ready' | 'analyzing' | 'done'
  file: null,           // File object or { name, size, fake: true }
  uploadResult: null,   // { filename, stats }
  report: null,         // { report_md }
  step: "upload",       // 'upload' | 'compute' | 'insights'
  error: null,
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

function formatStats(col) {
  const s = col.stats;
  if (col.type === "numeric") {
    return `min ${s.min} · max ${s.max} · 평균 ${s.mean} · std ${s.std}`;
  }
  if (col.type === "categorical") {
    return `유니크 ${s.unique} · 상위: ${s.top.join(", ")}`;
  }
  if (col.type === "datetime") {
    return `${String(s.min).slice(0, 10)} ~ ${String(s.max).slice(0, 10)}`;
  }
  return "";
}

function badgeHtml(type) {
  const map = { numeric: ["badge-num", "수치형"], categorical: ["badge-cat", "범주형"], datetime: ["badge-dat", "날짜형"] };
  const [cls, label] = map[type] ?? ["badge-num", type];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── DOM refs ────────────────────────────────────────────────────────────────

const pageHeader    = document.getElementById("pageHeader");
const headerActions = document.getElementById("headerActions");
const pageMain      = document.getElementById("pageMain");

window.addEventListener("scroll", () => {
  pageHeader.classList.toggle("is-scrolled", window.scrollY > 4);
}, { passive: true });

// ─── Render ──────────────────────────────────────────────────────────────────

function render() {
  renderHeader();
  if (state.screen === "idle" || state.screen === "ready") renderUpload();
  else if (state.screen === "analyzing") renderAnalyzing();
  else if (state.screen === "done") renderReport();
}

function renderHeader() {
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

function renderUpload() {
  const { file, error } = state;

  pageMain.innerHTML = `
    <section class="upload">
      <div>
        <h1 class="upload-title">CSV 한 번에 분석합니다</h1>
        <p class="upload-subtitle">파일을 올리면 Claude가 통계와 인사이트를 한국어로 정리해 드립니다.</p>
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

function renderAnalyzing() {
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
        <h2 class="analyzing-title">Claude가 데이터를 분석하고 있습니다…</h2>
        <p class="analyzing-sub">${state.uploadResult?.filename ?? state.file?.name ?? ""}</p>
      </div>
      <div class="steps">${stepsHtml}</div>
    </div>
  `;
}

function renderReport() {
  const { uploadResult, report } = state;
  const { overview, columns }   = uploadResult.stats;

  const cards = [
    { label: "행 수",  value: overview.rows.toLocaleString(),              sub: "rows" },
    { label: "열 수",  value: overview.columns,                            sub: "columns" },
    { label: "결측률", value: `${(overview.missing_rate * 100).toFixed(1)}%`, sub: "missing rate" },
    { label: "용량",   value: `${overview.memory_mb} MB`,                  sub: "in memory" },
  ];

  const cardsHtml = cards.map((c) => `
    <div class="stat-card">
      <div class="stat-card-label">${c.label}</div>
      <div class="stat-card-value t-num">${c.value}</div>
      <div class="stat-card-sub">${c.sub}</div>
    </div>
  `).join("");

  const colsHtml = Object.entries(columns).map(([name, col]) => `
    <tr>
      <td class="col-name">${name}</td>
      <td>${badgeHtml(col.type)}</td>
      <td class="col-stats">${formatStats(col)}</td>
      <td class="col-miss">${col.stats.missing}</td>
    </tr>
  `).join("");

  const now = new Date().toLocaleString("ko-KR");

  pageMain.innerHTML = `
    <section class="report">
      <header class="report-header">
        <h1 class="report-title">${uploadResult.filename}</h1>
        <div class="report-meta">생성: ${now}</div>
      </header>
      <div>
        <p class="section-label">데이터 개요</p>
        <div class="overview-grid">${cardsHtml}</div>
      </div>
      <div>
        <p class="section-label">컬럼 요약</p>
        <table class="col-table">
          <thead><tr><th>컬럼</th><th>타입</th><th>통계</th><th style="text-align:right">결측</th></tr></thead>
          <tbody>${colsHtml}</tbody>
        </table>
      </div>
      <div>
        <p class="section-label">AI 인사이트</p>
        <div class="insights" id="insightsBody"></div>
      </div>
    </section>
  `;

  document.getElementById("insightsBody").innerHTML = marked.parse(report.report_md);
}

// ─── API ─────────────────────────────────────────────────────────────────────

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
      const fd = new FormData();
      fd.append("file", state.file);
      const res = await fetch("/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? "업로드 중 오류가 발생했습니다.");
      }
      uploadResult = await res.json();
    }

    setState({ step: "compute", uploadResult });
    await new Promise((r) => setTimeout(r, 400));
    setState({ step: "insights" });

    const res = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: uploadResult.filename, stats: uploadResult.stats }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "분석 중 오류가 발생했습니다.");
    }
    const report = await res.json();

    await new Promise((r) => setTimeout(r, 300));
    setState({ screen: "done", report });
    window.scrollTo({ top: 0 });

  } catch (err) {
    setState({ screen: "ready", error: err.message });
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

// ─── Init ────────────────────────────────────────────────────────────────────
render();
