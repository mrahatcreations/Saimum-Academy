import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { Registration } from '../../types/admission';
import { Save } from 'lucide-react';
import BangladeshAddressPicker from '../ui/BangladeshAddressPicker';
import type { AddressValue } from '../ui/BangladeshAddressPicker';

interface EditAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onUpdateRegistration: (updatedReg: Registration) => void;
}

export default function EditAdmissionModal({
  isOpen,
  onClose,
  registration,
  onUpdateRegistration
}: EditAdmissionModalProps) {
  const [formData, setFormData] = useState<Registration | null>(null);

  useEffect(() => {
    if (registration) {
      const cloned = JSON.parse(JSON.stringify(registration));
      if (!cloned.person.presentAddress) {
        cloned.person.presentAddress = { division: 'Dhaka', district: 'Dhaka', thana: '', addressLine: '' };
      }
      if (!cloned.person.permanentAddress) {
        cloned.person.permanentAddress = { division: 'Dhaka', district: 'Dhaka', thana: '', addressLine: '' };
      }
      if (!cloned.person.emergencyContact) {
        cloned.person.emergencyContact = { name: '', relation: 'Father', phone: '' };
      }
      setFormData(cloned);
    }
  }, [registration]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRegistration(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Application: ${formData.registrationNo}`} size="xl">
      <form onSubmit={handleSubmit}>
        
        {/* 1. Program Details */}
        <h4 style={{fontSize: '0.9rem', color: 'var(--brand-orange)', marginBottom: '12px', fontWeight: 800}}>
          1. Program & Course Offering
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Branch</label>
            <select 
              className="select" 
              value={formData.branchName}
              onChange={e => setFormData({
                ...formData,
                branchName: e.target.value,
                branchType: e.target.value === 'Online Academy' ? 'ONLINE' : 'PHYSICAL'
              })}
            >
              <option value="Dhaka Central">Dhaka Central (Physical)</option>
              <option value="Mirpur Branch">Mirpur Branch (Physical)</option>
              <option value="Online Academy">Online Academy (Online)</option>
            </select>
          </div>
          <div className="formGroup">
            <label className="label">Department</label>
            <select 
              className="select" 
              value={formData.departmentName}
              onChange={e => setFormData({...formData, departmentName: e.target.value})}
            >
              <option value="Music Department">Music Department</option>
              <option value="Acting & Drama Department">Acting & Drama Department</option>
              <option value="Recitation Department">Recitation Department</option>
            </select>
          </div>
        </div>

        <div className="formGroup">
          <label className="label">Master Subject</label>
          <select 
            className="select" 
            value={formData.subjectName}
            onChange={e => setFormData({...formData, subjectName: e.target.value})}
          >
            <option value="Vocal Music">Vocal Music</option>
            <option value="Junior Music">Junior Music</option>
            <option value="Acting & Drama">Acting & Drama</option>
            <option value="Recitation & Elocution">Recitation & Elocution</option>
          </select>
        </div>

        {/* 2. Personal Information */}
        <h4 style={{fontSize: '0.9rem', color: 'var(--brand-orange)', marginTop: '20px', marginBottom: '12px', fontWeight: 800}}>
          2. Personal & Identity (People Record)
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Full Name (English)*</label>
            <input 
              type="text" 
              className="input" 
              required
              value={formData.person.fullNameEn}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, fullNameEn: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Full Name (Bengali)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="ঐচ্ছিক"
              value={formData.person.fullNameBn || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, fullNameBn: e.target.value }
              })}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Phone Number*</label>
            <input 
              type="text" 
              className="input" 
              required
              value={formData.person.phone}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, phone: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Date of Birth*</label>
            <input 
              type="date" 
              className="input" 
              required
              value={formData.person.dob}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, dob: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Gender*</label>
            <select 
              className="select" 
              value={formData.person.gender}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, gender: e.target.value as 'MALE' | 'FEMALE' }
              })}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input" 
              value={formData.person.email || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, email: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Blood Group</label>
            <select 
              className="select" 
              value={formData.person.bloodGroup || 'B+'}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, bloodGroup: e.target.value }
              })}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div className="formGroup">
            <label className="label">Birth Cert / NID No.</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.nidBirthCert || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, nidBirthCert: e.target.value }
              })}
            />
          </div>
        </div>

        {/* 3. Guardian Details */}
        <h4 style={{fontSize: '0.9rem', color: 'var(--brand-orange)', marginTop: '20px', marginBottom: '12px', fontWeight: 800}}>
          3. Parents & Emergency Contacts
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Father's Name</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.fatherName}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, fatherName: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Father's Mobile</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.fatherPhone || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, fatherPhone: e.target.value }
              })}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Mother's Name</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.motherName}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, motherName: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Mother's Mobile</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.motherPhone || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, motherPhone: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Emergency Contact Name</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.emergencyContact?.name || ''}
              onChange={e => setFormData({
                ...formData,
                person: {
                  ...formData.person,
                  emergencyContact: {
                    name: e.target.value,
                    relation: formData.person.emergencyContact?.relation || 'Father',
                    phone: formData.person.emergencyContact?.phone || ''
                  }
                }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Relation</label>
            <select 
              className="select" 
              value={formData.person.emergencyContact?.relation || 'Father'}
              onChange={e => setFormData({
                ...formData,
                person: {
                  ...formData.person,
                  emergencyContact: {
                    name: formData.person.emergencyContact?.name || '',
                    relation: e.target.value,
                    phone: formData.person.emergencyContact?.phone || ''
                  }
                }
              })}
            >
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Uncle">Uncle</option>
              <option value="Legal Guardian">Legal Guardian</option>
            </select>
          </div>
          <div className="formGroup">
            <label className="label">Emergency Mobile</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.emergencyContact?.phone || ''}
              onChange={e => setFormData({
                ...formData,
                person: {
                  ...formData.person,
                  emergencyContact: {
                    name: formData.person.emergencyContact?.name || '',
                    relation: formData.person.emergencyContact?.relation || 'Father',
                    phone: e.target.value
                  }
                }
              })}
            />
          </div>
        </div>

        {/* Bangladesh Geographic Cascading Address Picker - Present Address */}
        <BangladeshAddressPicker 
          label="Present Address"
          value={{
            division: formData.person.presentAddress?.division || 'Dhaka',
            district: formData.person.presentAddress?.district || 'Dhaka',
            thana: formData.person.presentAddress?.thana || '',
            addressLine: formData.person.presentAddress?.addressLine || ''
          }}
          onChange={(newVal: AddressValue) => setFormData({
            ...formData,
            person: {
              ...formData.person,
              presentAddress: {
                division: newVal.division || 'Dhaka',
                district: newVal.district,
                thana: newVal.thana,
                addressLine: newVal.addressLine
              }
            }
          })}
          required
        />

        {/* Permanent Address */}
        <div style={{marginTop: '16px'}}>
          <BangladeshAddressPicker 
            label="Permanent Address"
            value={{
              division: formData.person.permanentAddress?.division || 'Dhaka',
              district: formData.person.permanentAddress?.district || 'Dhaka',
              thana: formData.person.permanentAddress?.thana || '',
              addressLine: formData.person.permanentAddress?.addressLine || ''
            }}
            onChange={(newVal: AddressValue) => setFormData({
              ...formData,
              person: {
                ...formData.person,
                permanentAddress: {
                  division: newVal.division || 'Dhaka',
                  district: newVal.district,
                  thana: newVal.thana,
                  addressLine: newVal.addressLine
                }
              }
            })}
            required
          />
        </div>

        {/* 4. Academic Background */}
        <h4 style={{fontSize: '0.9rem', color: 'var(--brand-orange)', marginTop: '20px', marginBottom: '12px', fontWeight: 800}}>
          4. Academic & Cultural Background
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Institution Name</label>
            <input 
              type="text" 
              className="input" 
              value={formData.person.academicInstitution || ''}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, academicInstitution: e.target.value }
              })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Current Class / Grade</label>
            <select 
              className="select" 
              value={formData.person.currentClass || 'Class 5'}
              onChange={e => setFormData({
                ...formData,
                person: { ...formData.person, currentClass: e.target.value }
              })}
            >
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
              <option value="Class 6">Class 6</option>
              <option value="Class 7">Class 7</option>
              <option value="Class 8">Class 8</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 10">Class 10</option>
              <option value="HSC / College">HSC / College</option>
              <option value="Honours / University">Honours / University</option>
            </select>
          </div>
        </div>

        <div className="formGroup">
          <label className="label">Previous Cultural Experience</label>
          <textarea 
            className="input" 
            rows={2}
            value={formData.person.previousCulturalTraining || ''}
            onChange={e => setFormData({
              ...formData,
              person: { ...formData.person, previousCulturalTraining: e.target.value }
            })}
          />
        </div>

        {/* 5. Status & Viva Result */}
        <h4 style={{fontSize: '0.9rem', color: 'var(--brand-orange)', marginTop: '20px', marginBottom: '12px', fontWeight: 800}}>
          5. Lifecycle Status & Viva Evaluation
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Admission Status</label>
            <select 
              className="select" 
              value={formData.status}
              onChange={e => setFormData({
                ...formData,
                status: e.target.value as Registration['status']
              })}
            >
              <option value="PENDING_VIVA">Pending Viva</option>
              <option value="VIVA_SCHEDULED">Viva Scheduled</option>
              <option value="SELECTED">Selected</option>
              <option value="SELECTED_WORKSHOP">Selected for Workshop</option>
              <option value="REJECTED">Rejected</option>
              <option value="REGULAR_STUDENT">Regular Student</option>
            </select>
          </div>
          <div className="formGroup">
            <label className="label">Viva Score (Out of 100)</label>
            <input 
              type="number" 
              className="input" 
              placeholder="e.g. 85"
              value={formData.viva?.score ?? ''}
              onChange={e => setFormData({
                ...formData,
                viva: {
                  scheduledDate: formData.viva?.scheduledDate || '',
                  scheduledTime: formData.viva?.scheduledTime || '',
                  room: formData.viva?.room || '',
                  examinerPanel: formData.viva?.examinerPanel || '',
                  notes: formData.viva?.notes,
                  score: e.target.value ? Number(e.target.value) : undefined
                }
              })}
            />
          </div>
        </div>

        <div className="formActions" style={{marginTop: '28px'}}>
          <button type="button" className="btnCancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btnSubmit">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
