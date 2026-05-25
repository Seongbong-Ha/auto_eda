import { state } from "../store.js";
import { setupChat } from "./chat.js";

const pageMain = document.getElementById("pageMain");

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
  const map = { 
    numeric: ["badge-num", "수치형"], 
    categorical: ["badge-cat", "범주형"], 
    datetime: ["badge-dat", "날짜형"] 
  };
  const [cls, label] = map[type] ?? ["badge-num", type];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function renderReport() {
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

      <div class="chat-section">
        <p class="section-label">에이전트와 대화하기</p>
        ${uploadResult.session_id ? `
          <div class="chat-messages" id="chatMessages"></div>
          <form class="chat-form" id="chatForm">
            <input class="chat-input" id="chatInput" type="text"
              placeholder="데이터에 대해 질문해 보세요..." autocomplete="off">
            <button class="btn btn-primary" id="chatSend" type="submit">전송</button>
          </form>
        ` : `<p class="chat-disabled">샘플 데이터는 채팅을 지원하지 않습니다.</p>`}
      </div>
    </section>
  `;

  document.getElementById("insightsBody").innerHTML = window.marked.parse(report.report_md);

  if (uploadResult.session_id) {
    setupChat(uploadResult.session_id);
  }
}
