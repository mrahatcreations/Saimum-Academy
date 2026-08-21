import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { CustomSelect } from '../ui/CustomSelect';
import type { Registration } from '../../types/admission';
import { Calendar, Clock, MapPin, UserCheck } from 'lucide-react';

interface ScheduleVivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onConfirmSchedule: (regId: string, vivaData: {
    date: string;
    time: string;
    examiner: string;
    locationOrLink: string;
  }) => void;
}

export default function ScheduleVivaModal({
  isOpen,
  onClose,
  registration,
  onConfirmSchedule
}: ScheduleVivaModalProps) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    examiner: 'Ustadh Mahbubur Rahman',
    locationOrLink: ''
  });

  useEffect(() => {
    if (registration?.viva) {
      setFormData({
        date: registration.viva.scheduledDate || '',
        time: registration.viva.scheduledTime || '',
        examiner: registration.viva.examinerPanel || 'Ustadh Mahbubur Rahman',
        locationOrLink: registration.viva.room || ''
      });
    } else {
      setFormData({
        date: '',
        time: '',
        examiner: 'Ustadh Mahbubur Rahman',
        locationOrLink: ''
      });
    }
  }, [registration, isOpen]);

  if (!isOpen || !registration) return null;

  // Auto populate default location or zoom link based on branch type
  const isOnline = registration.branchType === 'ONLINE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSchedule(registration.id, {
      ...formData,
      locationOrLink: formData.locationOrLink || (isOnline ? 'Zoom Meeting ID: 849 2011 9921' : `${registration.branchName} Room 204`)
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Schedule Viva for ${registration.person.fullNameEn}`}>
      <div style={{marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
        Candidate ID: <strong>{registration.registrationNo}</strong> • Subject: <strong>{registration.subjectName}</strong> ({registration.branchName})
      </div>

      <form onSubmit={handleSubmit}>
        <div className="formGroup">
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

        <div className="formGroup">
          <label className="label">
            <Clock size={14} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}} />
            Viva Time Slot
          </label>
          <input 
            type="time" 
            className="input" 
            required
            value={formData.time}
            onChange={e => setFormData({...formData, time: e.target.value})}
          />
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
              { value: 'Mohammad Tareq', label: 'Mohammad Tareq (Music Department)' },
              { value: 'Ahmadullah Kawsar', label: 'Ahmadullah Kawsar (Acting Department)' }
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
            {isOnline ? 'Zoom / Online Meeting Link' : 'Physical Viva Room / Venue'}
          </label>
          <input 
            type="text" 
            className="input" 
            placeholder={isOnline ? 'Zoom Meeting ID / Link' : 'Dhaka Central Academy, Room 102'}
            value={formData.locationOrLink}
            onChange={e => setFormData({...formData, locationOrLink: e.target.value})}
          />
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnSubmit">Confirm & Send Notification</button>
        </div>
      </form>
    </Modal>
  );
}
