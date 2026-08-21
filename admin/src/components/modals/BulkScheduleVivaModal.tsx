import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';
import type { Registration } from '../../types/admission';
import { Calendar, Clock, MapPin, UserCheck, Users, Sparkles } from 'lucide-react';

interface BulkScheduleVivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegistrations: Registration[];
  onConfirmBulkSchedule: (vivaData: {
    date: string;
    time: string;
    examiner: string;
    locationOrLink: string;
  }) => Promise<void>;
}

export default function BulkScheduleVivaModal({
  isOpen,
  onClose,
  selectedRegistrations,
  onConfirmBulkSchedule
}: BulkScheduleVivaModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    examiner: 'Ustadh Mahbubur Rahman',
    locationOrLink: 'Dhaka Central Academy, Room 102'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || selectedRegistrations.length === 0) return null;

  // Preset slot shortcuts
  const applySlotPreset = (slot: 'DAY1_MORN' | 'DAY1_EVE' | 'DAY2_MORN' | 'ONLINE') => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (slot === 'DAY1_MORN') {
      setFormData({
        date: formatDate(tomorrow),
        time: '10:00',
        examiner: 'Ustadh Mahbubur Rahman',
        locationOrLink: 'Dhaka Central Academy, Room 102'
      });
    } else if (slot === 'DAY1_EVE') {
      setFormData({
        date: formatDate(tomorrow),
        time: '15:00',
        examiner: 'Syed Al-Amin',
        locationOrLink: 'Dhaka Central Academy, Room 102'
      });
    } else if (slot === 'DAY2_MORN') {
      setFormData({
        date: formatDate(dayAfter),
        time: '10:00',
        examiner: 'Mohammad Tareq',
        locationOrLink: 'Mirpur Branch, Room 204'
      });
    } else if (slot === 'ONLINE') {
      setFormData({
        date: formatDate(tomorrow),
        time: '11:00',
        examiner: 'Ustadh Mahbubur Rahman',
        locationOrLink: 'Zoom Cloud Meeting (Meeting ID: 849 2011 9921)'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirmBulkSchedule(formData);
      onClose();
    } catch (err) {
      console.error('Failed to bulk schedule viva:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Schedule Viva for ${selectedRegistrations.length} Selected Candidates`}
    >
      <div style={{
        background: 'var(--brand-orange-subtle, rgba(255,121,14,0.1))',
        border: '1px solid var(--brand-orange-border, rgba(255,121,14,0.25))',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'var(--brand-orange)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Users size={20} />
        </div>
        <div>
          <div style={{fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)'}}>
            Group Slot Allocation ({selectedRegistrations.length} Candidates)
          </div>
          <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)'}}>
            All selected candidates will be assigned to this viva date, time slot & examiner panel simultaneously.
          </div>
        </div>
      </div>

      {/* Quick Slot Presets */}
      <div style={{marginBottom: '16px'}}>
        <label style={{fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px'}}>
          <Sparkles size={13} color="var(--brand-orange)" />
          Quick Slot Presets:
        </label>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <button
            type="button"
            onClick={() => applySlotPreset('DAY1_MORN')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            ☀️ Day 1 (Morning 10:00 AM)
          </button>
          <button
            type="button"
            onClick={() => applySlotPreset('DAY1_EVE')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            🌆 Day 1 (Evening 03:00 PM)
          </button>
          <button
            type="button"
            onClick={() => applySlotPreset('DAY2_MORN')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            📅 Day 2 (Morning 10:00 AM)
          </button>
          <button
            type="button"
            onClick={() => applySlotPreset('ONLINE')}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            🌐 Online Zoom Slot
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px'}}>
          <div className="formGroup" style={{marginBottom: 0}}>
            <label className="label">
              <Calendar size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
              Viva Date
            </label>
            <input 
              type="date" 
              className="input" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="formGroup" style={{marginBottom: 0}}>
            <label className="label">
              <Clock size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
              Time Slot
            </label>
            <input 
              type="time" 
              className="input" 
              required
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
            />
          </div>
        </div>

        <div className="formGroup">
          <label className="label">
            <UserCheck size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
            Examiner / Panel Lead
          </label>
          <CustomSelect 
            options={[
              { value: 'Ustadh Mahbubur Rahman', label: 'Ustadh Mahbubur Rahman (Central Director)' },
              { value: 'Syed Al-Amin', label: 'Syed Al-Amin (Mirpur Branch Lead)' },
              { value: 'Mohammad Tareq', label: 'Mohammad Tareq (Music Department Lead)' },
              { value: 'Ahmadullah Kawsar', label: 'Ahmadullah Kawsar (Acting Department Lead)' }
            ]}
            value={formData.examiner}
            onChange={val => setFormData({...formData, examiner: val})}
            variant="form"
            fullWidth
          />
        </div>

        <div className="formGroup">
          <label className="label">
            <MapPin size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
            Viva Venue / Physical Room or Zoom Link
          </label>
          <input 
            type="text" 
            className="input" 
            required
            placeholder="e.g. Dhaka Central Academy, Room 102 or Zoom Meeting Link"
            value={formData.locationOrLink}
            onChange={e => setFormData({...formData, locationOrLink: e.target.value})}
          />
        </div>

        {/* Preview of Candidates */}
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '8px 12px',
          background: 'var(--bg-body)',
          marginBottom: '18px',
          fontSize: '0.78rem'
        }}>
          <div style={{fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px'}}>
            Assigned Candidates Preview:
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
            {selectedRegistrations.map(r => (
              <span key={r.id} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '4px',
                padding: '2px 6px',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}>
                {r.registrationNo} - {r.person.fullNameEn}
              </span>
            ))}
          </div>
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btnSubmit" 
            disabled={isSubmitting || !formData.date}
          >
            {isSubmitting ? 'Scheduling...' : `Confirm Schedule for ${selectedRegistrations.length} Candidates`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
