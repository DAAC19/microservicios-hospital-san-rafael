import { useEffect, useRef } from "react";
import type { Metric, MetricType } from "../types/metric";
import Chart from "chart.js/auto";

interface Props {
  metrics: Metric[];
  metricTypes: MetricType[];
}

const COLORS = ["#378ADD","#1D9E75","#BA7517","#D4537E","#7F77DD","#D85A30"];

export default function MetricsCharts({ metrics, metricTypes }: Props) {
  const barRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<Chart | null>(null);
  const lineChart = useRef<Chart | null>(null);

  const getTypeName = (id: string | number) =>
    metricTypes.find((t) => String(t.id) === String(id))?.name || `Tipo ${id}`;

  useEffect(() => {
    const grouped: Record<string, number[]> = {};
    metrics.forEach((m) => {
      const key = getTypeName(m.metric_type_id);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m.value);
    });

    const types = Object.keys(grouped);
    const avgs = types.map((t) =>
      parseFloat((grouped[t].reduce((a, b) => a + b, 0) / grouped[t].length).toFixed(1))
    );

    if (barRef.current) {
      barChart.current?.destroy();
      barChart.current = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: types,
          datasets: [{
            label: "Promedio",
            data: avgs,
            backgroundColor: types.map((_, i) => COLORS[i % COLORS.length]),
            borderRadius: 6,
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: "rgba(128,128,128,0.1)" } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    if (lineRef.current) {
      lineChart.current?.destroy();
      lineChart.current = new Chart(lineRef.current, {
        type: "line",
        data: {
          labels: metrics.map((_, i) => `#${i + 1}`),
          datasets: types.slice(0, 3).map((t, i) => ({
            label: t,
            data: metrics
              .filter((m) => getTypeName(m.metric_type_id) === t)
              .map((m) => m.value),
            borderColor: COLORS[i],
            backgroundColor: "transparent",
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 2,
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: "rgba(128,128,128,0.1)" } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    return () => {
      barChart.current?.destroy();
      lineChart.current?.destroy();
    };
  }, [metrics, metricTypes]);

  const grouped: Record<string, number[]> = {};
  metrics.forEach((m) => {
    const key = getTypeName(m.metric_type_id);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m.value);
  });

  return (
    <div className="db-card">
      <div className="db-card-head">
        <div>
          <div className="db-card-title">Métricas del sistema</div>
          <div className="db-card-sub">Últimas lecturas por tipo de métrica</div>
        </div>
      </div>
      <div style={{ padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {Object.entries(grouped).map(([type, values], i) => (
            <div key={type} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "1rem" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{type}</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: COLORS[i % COLORS.length] }}>
                {(values.reduce((a,b)=>a+b,0)/values.length).toFixed(1)}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>{values.length} lecturas</div>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", width: "100%", height: 220, marginBottom: "1.25rem" }}>
          <canvas ref={barRef} role="img" aria-label="Promedio por tipo de métrica" />
        </div>
        <div style={{ position: "relative", width: "100%", height: 220 }}>
          <canvas ref={lineRef} role="img" aria-label="Tendencia de métricas" />
        </div>
      </div>
    </div>
  );
}