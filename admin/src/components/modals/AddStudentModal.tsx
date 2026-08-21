import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: { fullName: string; phone: string; email: string }) => void;
  initialData?: { id?: string; fullName: string; phone?: string; email?: string } | null;
}

export default function AddStudentModal({ isOpen, onClose, onAdd, initialData }: AddStudentModalProps) {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || ''
      });
    } else {
      setFormData({ fullName: '', phone: '', email: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ fullName: '', phone: '', email: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Student Profile" : "Register New Student"}>
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Full Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. Hasan Mahmud" 
            required
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
        </div>
        <div className="formGroup">
          <label className="label">Phone Number</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. 017XXXXXXXX" 
            required
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="formGroup">
          <label className="label">Email Address (Optional)</label>
          <input 
            type="email" 
            className="input" 
            placeholder="e.g. hasan@example.com" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnSubmit">{initialData ? "Update Student" : "Register Student"}</button>
        </div>
      </form>
    </Modal>
  );
}
