import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './MetricsStrip.module.css';

export interface MetricItem {
  id?: string;
  label: string;
  value: string | number;
  delta?: {
    value: string;
    isPositive?: boolean;
  };
  sparklineData?: number[];
  sparklineColor?: string;
}

interface MetricsStripProps {
  metrics: MetricItem[];
  className?: string;
}

// Generate smooth SVG polyline path from data points
function generateSparklinePath(data: number[], width: number = 100, height: number = 32): string {
  if (!data || data.length < 2) return '';
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const padding = 3;
  const usableHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  return points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');
}

export const MetricsStrip: React.FC<MetricsStripProps> = ({ metrics, className = '' }) => {
  return (
    <div className={`${styles.metricsStrip} ${className}`}>
      {metrics.map((metric, idx) => {
        const sparklineColor = metric.sparklineColor || 'var(--brand-orange, #FF790E)';
        const sparklinePoints = metric.sparklineData || [10, 15, 12, 22, 18, 25, 20, 28];
        const path = generateSparklinePath(sparklinePoints, 110, 34);

        return (
          <div key={metric.id || idx} className={styles.metricCell}>
            <div className={styles.metricContent}>
              <span className={styles.metricLabel}>{metric.label}</span>
              <div className={styles.valueRow}>
                <span className={styles.metricValue}>{metric.value}</span>
                {metric.delta && (
                  <span
                    className={`${styles.deltaBadge} ${
                      metric.delta.isPositive !== false ? styles.deltaPositive : styles.deltaNegative
                    }`}
                  >
                    {metric.delta.isPositive !== false ? (
                      <ArrowUpRight size={12} strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight size={12} strokeWidth={2.5} />
                    )}
                    {metric.delta.value}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.sparklineContainer}>
              <svg
                viewBox="0 0 110 34"
                className={styles.sparklineSvg}
                preserveAspectRatio="none"
              >
                <path
                  d={path}
                  fill="none"
                  stroke={sparklineColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};
