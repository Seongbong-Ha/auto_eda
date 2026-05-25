export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  
  const res = await fetch("/upload", { 
    method: "POST", 
    body: fd 
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "업로드 중 오류가 발생했습니다.");
  }
  return await res.json();
}

export async function analyzeData(filename, stats) {
  const res = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, stats }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "분석 중 오류가 발생했습니다.");
  }
  return await res.json();
}

export async function sendChat(sessionId, message) {
  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "채팅 중 오류가 발생했습니다.");
  }
  return await res.json();
}
