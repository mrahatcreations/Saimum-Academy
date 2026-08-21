import { useState } from 'react';
import { 
  ArrowRight
} from 'lucide-react';
import type { WorkshopBatchItem } from '../../services/workshopService';
import styles from './VivaEnrollmentDesk.module.css';

interface VivaEnrollmentDeskProps {
  batches: WorkshopBatchItem[];
  onEnroll: (batchId: string, candidates: any[]) => void;
}

export default function VivaEnrollmentDesk({ batches, onEnroll }: VivaEnrollmentDeskProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());

  // Demo / live viva candidates awaiting workshop batch allocation
  const [vivaCandidates] = useState([
    { id: 'v1', studentName: 'আরিফুল ইসলাম রিফাত', studentPhone: '+880 1712-334455', registrationNo: 'SA-2026-V101', vivaScore: 92, selectedSubject: 'কণ্ঠ সংগীত' },
    { id: 'v2', studentName: 'তানভীর আহমেদ', studentPhone: '+880 1819-556677', registrationNo: 'SA-2026-V102', vivaScore: 88, selectedSubject: 'মঞ্চ অভিনয়' },
    { id: 'v3', studentName: 'ফাহিম মোর্শেদ', studentPhone: '+880 1922-889900', registrationNo: 'SA-2026-V103', vivaScore: 85, selectedSubject: 'বাচিক শিল্প' },
    { id: 'v4', studentName: 'জুবায়ের বিন খালিদ', studentPhone: '+880 1733-112233', registrationNo: 'SA-2026-V104', vivaScore: 95, selectedSubject: 'কুরআন তিলাওয়াত' },
    { id: 'v5', studentName: 'মুহতাসিম বিল্লাহ', studentPhone: '+880 1611-445566', registrationNo: 'SA-2026-V105', vivaScore: 90, selectedSubject: 'কণ্ঠ সংগীত' },
    { id: 'v6', studentName: 'সাদমান সাকিব', studentPhone: '+880 1855-778899', registrationNo: 'SA-2026-V106', vivaScore: 86, selectedSubject: 'মঞ্চ অভিনয়' }
  ]);

  const handleToggleCandidate = (id: string) => {
    const next = new Set(selectedCandidateIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCandidateIds(next);
  };

  const handleSelectAll = () => {
    if (selectedCandidateIds.size === vivaCandidates.length) {
      setSelectedCandidateIds(new Set());
    } else {
      setSelectedCandidateIds(new Set(vivaCandidates.map(c => c.id)));
    }
  };

  const handleExecuteEnrollment = () => {
    if (!selectedBatchId || selectedCandidateIds.size === 0) return;
    const candidatesToEnroll = vivaCandidates.filter(c => selectedCandidateIds.has(c.id));
    onEnroll(selectedBatchId, candidatesToEnroll);
    setSelectedCandidateIds(new Set());
  };

  const targetBatch = batches.find(b => b.id === selectedBatchId);

  return (
    <div className={styles.container}>
      {/* 1. Header & Batch Selector Action Strip */}
      <div className={styles.actionStrip}>
        <div className={styles.batchSelectorGroup}>
          <label className={styles.selectorLabel}>Target Workshop Batch:</label>
          <select
            className={styles.batchSelect}
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.enrollments?.length || 0}/{b.maxCapacity} Enrolled)
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={styles.btnEnrollAction}
          disabled={selectedCandidateIds.size === 0 || !selectedBatchId}
          onClick={handleExecuteEnrollment}
        >
          <span>Allocate {selectedCandidateIds.size} Candidates to {targetBatch?.name || 'Batch'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 2. Candidate Selection Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableTopHeader}>
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Viva Selected Candidates Awaiting Batch Allocation ({vivaCandidates.length})
          </span>
          <button type="button" className={styles.toggleAllBtn} onClick={handleSelectAll}>
            {selectedCandidateIds.size === vivaCandidates.length ? 'Deselect All' : 'Select All Candidates'}
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px' }} />
              <th>Registration No</th>
              <th>Candidate Name</th>
              <th>Phone</th>
              <th>Primary Discipline</th>
              <th>Viva Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vivaCandidates.map(c => {
              const isSelected = selectedCandidateIds.has(c.id);
              return (
                <tr
                  key={c.id}
                  className={`${styles.tr} ${isSelected ? styles.trSelected : ''}`}
                  onClick={() => handleToggleCandidate(c.id)}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCandidate(c.id)}
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--brand-orange)' }}>
                    {c.registrationNo}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.studentName}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {c.studentPhone}
                  </td>
                  <td>
                    <span className={styles.subjectPill}>{c.selectedSubject}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>
                    {c.vivaScore} / 100
                  </td>
                  <td>
                    <span className={styles.selectedBadge}>SELECTED</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
