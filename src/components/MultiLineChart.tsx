'use client';

import { Line } from 'react-chartjs-2';
import '@/lib/chart';

export type MultiLineDataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderDash?: number[];
};

export default function MultiLineChart({
  labels,
  datasets,
  height = 180
}: {
  labels: string[];
  datasets: MultiLineDataset[];
  height?: number;
}) {
  return (
    <div className="rounded-2xl bg-panel p-4">
      <Line
        height={height}
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#9aa4b2' }, grid: { display: false } },
            y: { ticks: { color: '#9aa4b2' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }}
      />
    </div>
  );
}
