import React from 'react';
import styles from './ScoreMeter.module.css';

interface ScoreMeterProps {
  score?: number | null;
  maxScore?: number;
  showLabel?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  maxScore = 10,
  showLabel = true
}) => {
  if (score === undefined || score === null) {
    return <span className={styles.noScore}>N/A</span>;
  }

  // Normalize score to 10 scale for visual bars
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const ratio = normalizedScore / maxScore;
  const filledBars = Math.round(ratio * 10);

  // Determine color theme based on score
  let scoreClass = styles.highScore; // Green / High
  if (ratio < 0.5) {
    scoreClass = styles.lowScore; // Red / Low
  } else if (ratio < 0.75) {
    scoreClass = styles.midScore; // Amber / Mid
  }

  return (
    <div className={styles.container}>
      <div className={styles.barGroup}>
        {Array.from({ length: 10 }).map((_, index) => {
          const isFilled = index < filledBars;
          return (
            <div
              key={index}
              className={`${styles.bar} ${isFilled ? scoreClass : styles.emptyBar}`}
            />
          );
        })}
      </div>
      {showLabel && (
        <span className={styles.scoreText}>
          {normalizedScore}/{maxScore}
        </span>
      )}
    </div>
  );
};
