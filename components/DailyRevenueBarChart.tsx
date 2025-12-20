import React from 'react';

interface ChartData {
    day: number;
    total: number;
}

interface DailyRevenueBarChartProps {
    data: ChartData[];
    daysInMonth: number;
}

const DailyRevenueBarChart: React.FC<DailyRevenueBarChartProps> = ({ data, daysInMonth }) => {
    const dataMap = new Map(data.map(d => [d.day, d.total]));
    const maxRevenue = Math.max(...data.map(d => d.total), 0);
    
    const chartHeight = 250;
    const chartWidth = 900; // Fixed width, bars will adjust
    const barMargin = 4;
    const barWidth = (chartWidth - (daysInMonth - 1) * barMargin) / daysInMonth;

    const allDaysData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
            day,
            total: dataMap.get(day) || 0,
        };
    });

    return (
        <div className="w-full overflow-x-auto p-2 bg-slate-50 rounded-lg">
            <svg width={chartWidth} height={chartHeight} aria-label="Daily Revenue Bar Chart">
                <g className="bars">
                    {allDaysData.map((d, i) => {
                        const barHeight = maxRevenue > 0 ? (d.total / maxRevenue) * (chartHeight - 30) : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 20;
                        
                        return (
                            <g key={d.day}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className="fill-primary-400 hover:fill-primary-500 transition-colors"
                                    rx="2"
                                    ry="2"
                                >
                                    <title>{`Day ${d.day}: $${d.total.toFixed(2)}`}</title>
                                </rect>
                            </g>
                        );
                    })}
                </g>
                <g className="labels">
                    {allDaysData.map((d, i) => {
                        if ((d.day - 1) % 2 === 0) { // Show label for every other day to avoid clutter
                            return (
                                <text
                                    key={d.day}
                                    x={i * (barWidth + barMargin) + barWidth / 2}
                                    y={chartHeight - 5}
                                    textAnchor="middle"
                                    className="text-xs fill-slate-500"
                                >
                                    {d.day}
                                </text>
                            );
                        }
                        return null;
                    })}
                </g>
            </svg>
        </div>
    );
};

export default DailyRevenueBarChart;
