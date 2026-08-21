import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (branch: { name: string; code: string; type: string }) => void;
  initialData?: { id?: string; name: string; code: string | null; type: string } | null;
}

export default function AddBranchModal({ isOpen, onClose, onAdd, initialData }: AddBranchModalProps) {
  const [formData, setFormData] = useState({ name: '', code: '', type: 'PHYSICAL' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        type: initialData.type || 'PHYSICAL'
      });
    } else {
      setFormData({ name: '', code: '', type: 'PHYSICAL' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', code: '', type: 'PHYSICAL' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Branch" : "Add New Branch"}>
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Branch Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. Uttara Branch" 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="formGroup">
          <label className="label">Branch Code</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. UTT-03" 
            value={formData.code}
            onChange={e => setFormData({...formData, code: e.target.value})}
          />
        </div>
        <div className="formGroup">
          <label className="label">Branch Type</label>
          <select 
            className="select"
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="PHYSICAL">Physical Location</option>
            <option value="ONLINE">Online Platform</option>
          </select>
        </div>
        
        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnSubmit">{initialData ? "Update Branch" : "Save Branch"}</button>
        </div>
      </form>
    </Modal>
  );
}
