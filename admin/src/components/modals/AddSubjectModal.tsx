import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (subject: { name: string; code: string }) => void;
  initialData?: { id?: string; name: string; code: string | null } | null;
}

export default function AddSubjectModal({ isOpen, onClose, onAdd, initialData }: AddSubjectModalProps) {
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || ''
      });
    } else {
      setFormData({ name: '', code: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', code: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Subject" : "Add New Subject"}>
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
          <button type="submit" className="btnSubmit">{initialData ? "Update Subject" : "Save Subject"}</button>
        </div>
      </form>
    </Modal>
  );
}
