function Button({ variant = "primary", size, icon, children, ...rest }) {
  const cls = ["btn", `btn-${variant}`, size === "lg" && "btn-lg"]
    .filter(Boolean).join(" ");
  return (
    <button className={cls} {...rest}>
      {icon ? icon : null}
      {children}
    </button>
  );
}

function Header({ scrolled, showReportActions, onDownload, onReset }) {
  return (
    <header className={"page-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="page-header-inner">
        <img src="../../assets/wordmark.svg" alt="Auto EDA" height="22"/>
        {showReportActions ? (
          <div className="page-header-actions">
            <Button variant="secondary" icon={<Icon.Download/>} onClick={onDownload}>
              MD 다운로드
            </Button>
            <Button variant="ghost" icon={<Icon.RefreshCw/>} onClick={onReset}>
              새 파일 분석
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

window.Button = Button;
window.Header = Header;
