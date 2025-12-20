import React from 'react';

interface ChartData {
    name: string;
    count: number;
}

interface SpecialTypesBarChartProps {
    data: ChartData[];
}

const SpecialTypesBarChart: React.FC<SpecialTypesBarChartProps> = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const chartHeight = 300;
    const barWidth = 35;
    const barMargin = 15;
    const chartWidth = data.length * (barWidth + barMargin);
    
    // Consistent color mapping for special types
    const colorMap: { [key: string]: string } = {
        'Vegetarian': 'fill-emerald-500',
        'Non-Vegetarian': 'fill-rose-500',
        'Vegan': 'fill-lime-500',
        "Chef's Special": 'fill-amber-500',
        'None': 'fill-slate-400',
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} aria-label="Special Types Bar Chart">
                 <g className="bars">
                    {data.map((d, i) => {
                        const barHeight = maxCount > 0 ? (d.count / maxCount) * (chartHeight - 40) : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 20;
                        const colorClass = colorMap[d.name] || 'fill-sky-500';
                        return (
                            <g key={d.name}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className={`${colorClass} transition-opacity hover:opacity-80`}
                                    rx="4"
                                    ry="4"
                                >
                                  <title>{`${d.name}: ${d.count} items`}</title>
                                </rect>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    className="text-xs font-semibold fill-slate-700"
                                >
                                    {d.count}
                                </text>
                            </g>
                        );
                    })}
                </g>
                <g className="labels">
                    {data.map((d, i) => (
                        <text
                            key={d.name}
                            x={i * (barWidth + barMargin) + barWidth / 2}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            className="text-xs fill-slate-500"
                        >
                             {d.name.length > 10 ? `${d.name.substring(0, 8)}..` : d.name}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default SpecialTypesBarChart;
