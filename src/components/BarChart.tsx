'use client';

import { Bar } from 'react-chartjs-2';
import '@/lib/chart';

export type BarChartPoint = {
  label: string;
  value: number;
};

export default function BarChart({ points, height = 200 }: { points: BarChartPoint[]; height?: number }) {
  return (
    <div className="rounded-2xl bg-panel p-4">
      <Bar
        height={height}
        data={{
          labels: points.map((point) => point.label),
          datasets: [
            {
              label: 'Change',
              data: points.map((point) => point.value),
              backgroundColor: points.map((point) =>
                point.value >= 0 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(248, 113, 113, 0.7)'
              ),
              borderRadius: 8
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
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
