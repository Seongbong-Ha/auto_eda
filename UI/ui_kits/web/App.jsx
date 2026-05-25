function App() {
  // screen states: 'idle' | 'ready' | 'analyzing' | 'done'
  const [screen, setScreen]     = React.useState("idle");
  const [file, setFile]         = React.useState(null);
  const [stepId, setStepId]     = React.useState("upload");
  const [scrolled, setScrolled] = React.useState(false);
  const report = SAMPLE_REPORT;

  // scroll-triggered border on header
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onFile = (f) => {
    setFile(f);
    setScreen("ready");
  };
  const clearFile = () => {
    setFile(null);
    setScreen("idle");
  };
  const reset = () => {
    setFile(null);
    setStepId("upload");
    setScreen("idle");
    window.scrollTo({ top: 0 });
  };

  // Pick a fake sample (so demo works without a real CSV)
  const pickSample = (name, size) => {
    setFile({ name, size, fake: true });
    setScreen("ready");
  };

  const start = () => {
    setScreen("analyzing");
    setStepId("upload");
    // Walk through the steps on a timer to simulate the backend.
    setTimeout(() => setStepId("compute"),  900);
    setTimeout(() => setStepId("insights"), 2100);
    setTimeout(() => { setScreen("done"); window.scrollTo({ top: 0 }); }, 3600);
  };

  const downloadMd = () => {
    const md = [
      `# ${report.filename} — EDA 리포트`,
      ``,
      `생성: ${report.generated_at}`,
      ``,
      `## 개요`,
      ``,
      `- 행 수: ${report.overview.rows.toLocaleString()}`,
      `- 열 수: ${report.overview.columns}`,
      `- 결측률: ${report.overview.missing_rate}%`,
      `- 용량: ${report.overview.memory_mb} MB`,
      ``,
      `## 컬럼 요약`,
      ``,
      ...report.columns.map((c) => `- **${c.name}** (${c.type}) — ${c.stats} · 결측 ${c.missing}`),
      ``,
      `## AI 인사이트`,
      ``,
      report.insights_html
        .replace(/<\/?h3>/g, "\n### ")
        .replace(/<\/?p>/g, "\n")
        .replace(/<\/?ul>/g, "\n")
        .replace(/<li>([^<]+)<\/li>/g, "- $1")
        .replace(/<[^>]+>/g, "")
        .trim(),
    ].join("\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.filename.replace(/\.csv$/, "")}-report.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="app">
      <Header
        scrolled={scrolled}
        showReportActions={screen === "done"}
        onDownload={downloadMd}
        onReset={reset}
      />
      <main className="page-main">
        {(screen === "idle" || screen === "ready") && (
          <section className="upload">
            <div>
              <h1 className="upload-title">CSV 한 번에 분석합니다</h1>
              <p className="upload-subtitle">
                파일을 올리면 Claude가 통계와 인사이트를 한국어로 정리해 드립니다.
              </p>
            </div>
            <Dropzone file={file} onFile={onFile} onClear={clearFile}/>
            {screen === "ready" ? (
              <div className="upload-actions">
                <Button variant="primary" size="lg" onClick={start}>분석 시작</Button>
              </div>
            ) : (
              <div className="upload-samples">
                <span style={{padding: "6px 0"}}>샘플로 시작:</span>
                <button onClick={() => pickSample("sales_2025.csv", 2_457_600)}>sales_2025.csv</button>
                <button onClick={() => pickSample("users_q1.csv",   812_032)}>users_q1.csv</button>
                <button onClick={() => pickSample("traffic.csv",    5_341_184)}>traffic.csv</button>
              </div>
            )}
          </section>
        )}

        {screen === "analyzing" && <Analyzing currentStep={stepId}/>}

        {screen === "done" && (
          <section className="report">
            <header className="report-header">
              <h1 className="report-title">{report.filename}</h1>
              <div className="report-meta">생성: {report.generated_at}</div>
            </header>

            <div>
              <p className="section-label">데이터 개요</p>
              <OverviewGrid overview={report.overview}/>
            </div>

            <div>
              <p className="section-label">컬럼 요약</p>
              <ColumnTable columns={report.columns}/>
            </div>

            <div>
              <p className="section-label">AI 인사이트</p>
              <div className="insights" dangerouslySetInnerHTML={{__html: report.insights_html}}/>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

window.App = App;
