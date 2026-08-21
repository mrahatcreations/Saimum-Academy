import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2
} from 'lucide-react';
import type { StaffItem } from '../../services/staffService';
import type { WorkshopBatchItem } from '../../services/workshopService';
import { UserAvatar } from '../ui/UserAvatar';
import styles from './ModeratorAssignModal.module.css';

interface ModeratorAssignModalProps {
  batch: WorkshopBatchItem;
  availableStaff: StaffItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (batchId: string, staffIds: string[]) => void;
}

export default function ModeratorAssignModal({
  batch,
  availableStaff,
  isOpen,
  onClose,
  onSave
}: ModeratorAssignModalProps) {
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(() => {
    return (batch.moderators || []).map(m => m.staffId || m.staff?.id);
  });

  if (!isOpen) return null;

  const handleToggle = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      setSelectedStaffIds(selectedStaffIds.filter(id => id !== staffId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, staffId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStaffIds.length === availableStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(availableStaff.map(s => s.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(batch.id, selectedStaffIds);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h3 className={styles.modalTitle}>Assign Batch Moderators</h3>
            <span className={styles.modalSubtitle}>
              Directly appointing in-house staff to manage {batch.name}
            </span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className={styles.actionBar}>
          <span className={styles.selectedCountText}>
            {selectedStaffIds.length} of {availableStaff.length} Staff Selected
          </span>
          <button type="button" className={styles.toggleAllBtn} onClick={handleSelectAll}>
            {selectedStaffIds.length === availableStaff.length ? 'Deselect All' : 'Select All Staff'}
          </button>
        </div>

        {/* Staff List Grid */}
        <div className={styles.staffGridList}>
          {availableStaff.map(staff => {
            const isSelected = selectedStaffIds.includes(staff.id);
            return (
              <div
                key={staff.id}
                className={`${styles.staffCardItem} ${isSelected ? styles.staffCardSelected : ''}`}
                onClick={() => handleToggle(staff.id)}
              >
                <div className={styles.checkboxBox}>
                  {isSelected ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      background: 'var(--brand-orange, #FF790E)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 900
                    }}>
                      ✓
                    </div>
                  ) : (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: '1.5px solid var(--border-dashed, #CBD5E1)',
                      background: 'transparent'
                    }} />
                  )}
                </div>

                <UserAvatar name={staff.fullName} size={36} shape="circle" />

                <div className={styles.staffMetaDetails}>
                  <span className={styles.staffNameTitle}>{staff.fullName}</span>
                  <span className={styles.staffDesignationText}>
                    {staff.designation || staff.role}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.btnSave} onClick={handleSubmit}>
            <CheckCircle2 size={15} />
            <span>Save Moderator Assignments</span>
          </button>
        </div>
      </div>
    </div>
  );
}
