const STEPS = [
  { id: "upload",   label: "업로드" },
  { id: "compute",  label: "통계 계산" },
  { id: "insights", label: "AI 분석" },
];

function StepIndicator({ currentStep }) {
  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const status = i < currentIdx ? "done" : i === currentIdx ? "active" : "idle";
        return (
          <React.Fragment key={s.id}>
            <div className="step">
              <span className={"step-dot " + status}>
                {status === "done"   && <Icon.Check/>}
                {status === "active" && <span className="spinner-sm"/>}
              </span>
              <span className={"step-label" + (status === "active" ? " is-active" : status === "done" ? " is-done" : "")}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? <div className="step-sep"/> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Analyzing({ currentStep }) {
  const captions = {
    upload:   "파일을 업로드하고 있습니다…",
    compute:  "통계를 계산하고 있습니다…",
    insights: "Claude가 데이터를 분석하고 있습니다…",
  };
  return (
    <div className="analyzing">
      <div className="spinner-lg"/>
      <div>
        <p className="analyzing-title">{captions[currentStep]}</p>
        <p className="analyzing-sub" style={{marginTop:8}}>잠시만 기다려 주세요.</p>
      </div>
      <StepIndicator currentStep={currentStep}/>
    </div>
  );
}

window.StepIndicator = StepIndicator;
window.Analyzing = Analyzing;
