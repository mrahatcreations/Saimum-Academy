import React, { useState } from 'react';
import Modal from '../ui/Modal';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (student: { fullName: string; phone: string; email: string }) => void;
}

export default function AddStudentModal({ isOpen, onClose, onAdd }: AddStudentModalProps) {
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ fullName: '', phone: '', email: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Student">
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
          <button type="submit" className="btnSubmit">Register Student</button>
        </div>
      </form>
    </Modal>
  );
}
