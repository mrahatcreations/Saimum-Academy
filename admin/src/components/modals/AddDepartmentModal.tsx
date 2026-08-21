import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  initialData?: { id?: string; name: string } | null;
}

export default function AddDepartmentModal({ isOpen, onClose, onAdd, initialData }: AddDepartmentModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name);
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Department" : "Create Department"}>
      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="label">Department Name</label>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. Saimum Cultural Wing" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        
        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnSubmit">{initialData ? "Update Department" : "Create Department"}</button>
        </div>
      </form>
    </Modal>
  );
}
