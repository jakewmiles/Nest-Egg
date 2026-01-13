'use client';

import { Line } from 'react-chartjs-2';
import '@/lib/chart';

export type LineChartPoint = {
  label: string;
  value: number;
};

export default function LineChart({
  points,
  height = 180
}: {
  points: LineChartPoint[];
  height?: number;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4">
      <Line
        height={height}
        data={{
          labels: points.map((point) => point.label),
          datasets: [
            {
              label: 'Net worth',
              data: points.map((point) => point.value),
              borderColor: '#8bd3ff',
              backgroundColor: 'rgba(139, 211, 255, 0.2)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
          },
          scales: {
            x: {
              ticks: { color: '#9aa4b2' },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#9aa4b2' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          }
        }}
      />
    </div>
  );
}
