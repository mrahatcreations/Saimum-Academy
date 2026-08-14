import React, { useState } from 'react';
import Modal from '../ui/Modal';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddDepartmentModal({ isOpen, onClose, onAdd }: AddDepartmentModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name);
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Department">
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
          <button type="submit" className="btnSubmit">Create Department</button>
        </div>
      </form>
    </Modal>
  );
}
