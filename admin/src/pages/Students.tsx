import React from 'react';
import styles from '../App.module.css';

export default function Students() {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>Student Directory</h2>
      </div>
      <p style={{color: 'var(--text-secondary)'}}>Student management implementation coming soon...</p>
    </div>
  );
}
