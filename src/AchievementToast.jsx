import React, { useEffect } from "react";
export function AchievementToast({ visible, onDismiss }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);
  if (!visible) return null;
  return (
    <aside
      className="achievement-toast"
      role="status"
      aria-label="발전과제 달성: 우주에 삼켜진 자"
    >
      <span className="achievement-emblem" aria-hidden="true">
        ✦
      </span>
      <div>
        <small>발전과제 달성</small>
        <strong>우주에 삼켜진 자</strong>
        <p>블랙홀에 영원히 갇혔습니다.</p>
      </div>
    </aside>
  );
}
