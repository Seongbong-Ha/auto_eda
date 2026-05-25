// A pre-baked sample report. The real product would receive this from
// the FastAPI backend; here it's a fixture so the click-thru shows the
// full Report screen with realistic content.

const SAMPLE_REPORT = {
  filename: "sales_2025.csv",
  generated_at: "2026-05-25 16:42",
  overview: {
    rows: 12489,
    columns: 18,
    missing_rate: 3.2,
    memory_mb: 2.4,
  },
  columns: [
    { name: "order_id",     type: "numeric",     stats: "min 1 · max 12,489 · mean 6,244.3",    missing: 0   },
    { name: "created_at",   type: "datetime",    stats: "2024-01-03 → 2025-12-31",              missing: 0   },
    { name: "region",       type: "categorical", stats: "unique 6 · top 서울, 경기, 부산",       missing: 12  },
    { name: "channel",      type: "categorical", stats: "unique 4 · top web, app, retail",       missing: 0   },
    { name: "customer_age", type: "numeric",     stats: "min 18 · max 78 · mean 38.4",          missing: 211 },
    { name: "items",        type: "numeric",     stats: "min 1 · max 24 · mean 2.7",            missing: 0   },
    { name: "subtotal_krw", type: "numeric",     stats: "min 1,200 · max 4.2M · mean 47,820",   missing: 0   },
    { name: "discount_pct", type: "numeric",     stats: "min 0 · max 0.45 · mean 0.08",         missing: 38  },
    { name: "shipped_at",   type: "datetime",    stats: "2024-01-04 → 2026-01-02 · 8% null",    missing: 996 },
  ],
  insights_html: `
    <h3>요약</h3>
    <p>
      <code>sales_2025.csv</code>는 <strong>12,489행 · 18열</strong>의 주문 데이터입니다.
      전체 결측률은 <strong>3.2%</strong>로 양호하며, 결측은 <code>shipped_at</code>(8%)와
      <code>customer_age</code>(1.7%) 두 컬럼에 집중되어 있습니다.
    </p>

    <h3>주요 패턴</h3>
    <ul>
      <li>주문 금액 <code>subtotal_krw</code>는 평균 47,820원이지만 최대값이 4.2M원으로,
          상위 1% 구간이 평균을 끌어올리는 <strong>강한 우측 꼬리</strong>를 보입니다.</li>
      <li>지역(<code>region</code>)은 서울 · 경기 · 부산 3개 권역이 전체의 약 78%를 차지합니다.</li>
      <li><code>discount_pct</code>가 0인 주문이 절반을 넘어, 할인 적용 자체가
          드문 이벤트임을 시사합니다.</li>
    </ul>

    <h3>다음 단계 제안</h3>
    <ul>
      <li><code>shipped_at</code>의 결측 996건이 미배송인지 데이터 누락인지 확인이 필요합니다.</li>
      <li>고액 주문(상위 1%)을 분리해 별도 분석하면 평균 왜곡을 줄일 수 있습니다.</li>
      <li>지역 × 채널 교차표로 채널 의존도가 권역마다 다른지 살펴볼 수 있습니다.</li>
    </ul>
  `,
};

window.SAMPLE_REPORT = SAMPLE_REPORT;
