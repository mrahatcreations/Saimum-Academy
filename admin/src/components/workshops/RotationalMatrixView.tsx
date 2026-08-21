import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock 
} from 'lucide-react';
import type { WorkshopBatchItem } from '../../services/workshopService';
import styles from './RotationalMatrixView.module.css';

interface RotationalMatrixViewProps {
  batches: WorkshopBatchItem[];
  onAddSlot?: (batchId: string) => void;
}

export default function RotationalMatrixView({ batches, onAddSlot }: RotationalMatrixViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>('FRIDAY');

  // Extract unique time slots across all batches for the selected day
  const timeSlots = React.useMemo(() => {
    const slots = new Set<string>();
    batches.forEach(b => {
      (b.rotationalSchedules || []).forEach(s => {
        if (s.dayOfWeek === selectedDay || s.dayOfWeek === 'DAILY') {
          slots.add(s.timeSlot);
        }
      });
    });
    // Default standard slots if none exist yet
    if (slots.size === 0) {
      return ['10:00 AM - 11:30 AM', '11:45 AM - 01:15 PM', '03:00 PM - 04:30 PM'];
    }
    return Array.from(slots);
  }, [batches, selectedDay]);

  return (
    <div className={styles.container}>
      {/* 1. Day Navigation Selector */}
      <div className={styles.topControlBar}>
        <div className={styles.daySelectorGroup}>
          {['FRIDAY', 'SATURDAY', 'DAILY'].map(day => (
            <button
              key={day}
              type="button"
              className={`${styles.dayBtn} ${selectedDay === day ? styles.dayBtnActive : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              <Calendar size={13} />
              <span>{day === 'FRIDAY' ? 'শুক্রবার (Friday)' : day === 'SATURDAY' ? 'শনিবার (Saturday)' : 'প্রতিদিন (Daily Schedule)'}</span>
            </button>
          ))}
        </div>

        <span className={styles.matrixNotice}>
          Synchronized Rotational Routine Across All Workshop Cohorts
        </span>
      </div>

      {/* 2. Synchronized Matrix Table */}
      <div className={styles.matrixTableWrapper}>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th className={styles.timeSlotTh}>
                <Clock size={13} />
                <span>Time Slot</span>
              </th>
              {batches.map(batch => (
                <th key={batch.id} className={styles.batchTh}>
                  <div className={styles.batchHeaderBox}>
                    <span className={styles.batchNameText}>{batch.name}</span>
                    <div className={styles.moderatorPillRow}>
                      <UserCheck size={11} color="var(--brand-orange)" />
                      <span>
                        Moderator: {batch.moderators?.[0]?.staff?.fullName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot} className={styles.matrixTr}>
                {/* Time Slot Column */}
                <td className={styles.timeSlotTd}>
                  <div className={styles.timeSlotBadge}>
                    {slot}
                  </div>
                </td>

                {/* Batch Rotational Cells */}
                {batches.map(batch => {
                  const scheduleSlot = (batch.rotationalSchedules || []).find(
                    s => (s.dayOfWeek === selectedDay || s.dayOfWeek === 'DAILY') && s.timeSlot === slot
                  );

                  return (
                    <td key={batch.id} className={styles.matrixTd}>
                      {scheduleSlot ? (
                        <div className={styles.scheduleSlotCard}>
                          <div className={styles.slotSubjectTitle}>
                            {scheduleSlot.subjectName}
                          </div>
                          {scheduleSlot.guestInstructorName && (
                            <div className={styles.slotInstructorMeta}>
                              <UserCheck size={12} />
                              <span>{scheduleSlot.guestInstructorName}</span>
                            </div>
                          )}
                          {scheduleSlot.roomNo && (
                            <div className={styles.slotRoomMeta}>
                              <MapPin size={11} />
                              <span>{scheduleSlot.roomNo}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={styles.emptySlotBox}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>No class scheduled</span>
                          {onAddSlot && (
                            <button
                              type="button"
                              className={styles.btnAddSlot}
                              onClick={() => onAddSlot(batch.id)}
                            >
                              <Plus size={11} />
                              <span>Schedule</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
