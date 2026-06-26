import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function PieChart({ labels, data, colors }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: colors || [
                            '#3B82F6',
                            '#EF4444',
                            '#10B981',
                            '#F59E0B',
                            '#8B5CF6',
                            '#EC4899',
                            '#06B6D4',
                        ],
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                },
            },
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [labels, data, colors]);

    return <canvas ref={chartRef} />;
}
