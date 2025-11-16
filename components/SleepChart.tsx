
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SleepPhase, SleepPhaseType } from '../types';

interface SleepChartProps {
  phases: SleepPhase[];
}

const PHASE_COLORS: Record<SleepPhaseType, string> = {
  [SleepPhaseType.AWAKE]: 'var(--chart-5)',
  [SleepPhaseType.REM]: 'var(--chart-4)',
  [SleepPhaseType.LIGHT]: 'var(--chart-2)',
  [SleepPhaseType.DEEP]: 'var(--chart-1)',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground p-2 rounded-app shadow-app border border-border">
        <p className="font-bold">{data.type}</p>
        <p>{data.duration} minutes</p>
      </div>
    );
  }
  return null;
};

const SleepChart: React.FC<SleepChartProps> = ({ phases }) => {
  const chartData = phases.map(phase => ({
    ...phase,
    fill: PHASE_COLORS[phase.type],
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          stackOffset="expand"
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="type" hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }}/>
          <Bar dataKey="duration" stackId="a" background={false}>
            {chartData.map((entry, index) => (
              <Bar key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepChart;
