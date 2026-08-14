import React, { useState } from 'react';
import Modal from '../ui/Modal';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subject: { name: string; code: string }) => void;
}

export default function AddSubjectModal({ isOpen, onClose, onAdd }: AddSubjectModalProps) {
  const [formData, setFormData] = useState({ name: '', code: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', code: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Subject">
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Subject Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. Recitation" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="formGroup">
          <label className="label">Subject Code (Optional)</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. REC-101" 
            value={formData.code}
            onChange={e => setFormData({...formData, code: e.target.value})}
          />
        </div>
        
        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnSubmit">Save Subject</button>
        </div>
      </form>
    </Modal>
  );
}
