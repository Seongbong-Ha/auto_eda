function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Dropzone({ onFile, file, onClear }) {
  const [dragover, setDragover] = React.useState(false);
  const inputRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  if (file) {
    return (
      <div className="file-card">
        <div className="file-card-icon"><Icon.FileText/></div>
        <div className="file-card-meta">
          <div className="file-card-name">{file.name}</div>
          <div className="file-card-sub">
            {formatBytes(file.size)} · CSV
          </div>
        </div>
        <button className="file-card-remove" onClick={onClear} aria-label="제거">
          <Icon.X/>
        </button>
      </div>
    );
  }

  return (
    <div
      className={"dropzone" + (dragover ? " is-dragover" : "")}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <Icon.UploadCloud/>
      <div className="dropzone-title">
        {dragover
          ? "놓으면 분석을 시작합니다"
          : "CSV 파일을 여기로 끌어다 놓으세요"}
      </div>
      <div className="dropzone-sub">
        또는 <span className="dropzone-link">파일 선택</span>
      </div>
      <div className="dropzone-meta">.csv · UTF-8, EUC-KR 자동 감지</div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="file-pick-input"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

window.Dropzone = Dropzone;
window.formatBytes = formatBytes;
