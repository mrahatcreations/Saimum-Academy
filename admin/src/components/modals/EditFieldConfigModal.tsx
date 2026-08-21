import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { FormFieldConfig } from '../../types/formBuilder';
import { Save } from 'lucide-react';

interface EditFieldConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: FormFieldConfig | null;
  onUpdateField: (updatedField: FormFieldConfig) => void;
}

export default function EditFieldConfigModal({
  isOpen,
  onClose,
  field,
  onUpdateField
}: EditFieldConfigModalProps) {
  const [formData, setFormData] = useState<FormFieldConfig | null>(null);
  const [optionsStr, setOptionsStr] = useState('');

  useEffect(() => {
    if (field) {
      setFormData(JSON.parse(JSON.stringify(field)));
      setOptionsStr(field.options ? field.options.join(', ') : '');
    }
  }, [field]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const options = optionsStr.trim() ? optionsStr.split(',').map(o => o.trim()).filter(Boolean) : undefined;

    onUpdateField({
      ...formData,
      options
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Field: ${formData.labelEn}`}>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Field Label (English)*</label>
            <input 
              type="text" 
              className="input" 
              required
              value={formData.labelEn}
              onChange={e => setFormData({ ...formData, labelEn: e.target.value })}
            />
          </div>
          <div className="formGroup">
            <label className="label">ফিল্ড লেবেল (বাংলায়)</label>
            <input 
              type="text" 
              className="input" 
              value={formData.labelBn}
              onChange={e => setFormData({ ...formData, labelBn: e.target.value })}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Placeholder Text</label>
            <input 
              type="text" 
              className="input" 
              value={formData.placeholder || ''}
              onChange={e => setFormData({ ...formData, placeholder: e.target.value })}
            />
          </div>
          <div className="formGroup">
            <label className="label">Help Text / Instruction</label>
            <input 
              type="text" 
              className="input" 
              value={formData.helpText || ''}
              onChange={e => setFormData({ ...formData, helpText: e.target.value })}
            />
          </div>
        </div>

        {(formData.fieldType === 'SELECT' || formData.fieldType === 'RADIO') && (
          <div className="formGroup">
            <label className="label">Dropdown / Radio Options (Comma Separated)</label>
            <input 
              type="text" 
              className="input" 
              value={optionsStr}
              onChange={e => setOptionsStr(e.target.value)}
            />
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-body)',
          borderRadius: '10px',
          marginTop: '8px'
        }}>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}}>
            <input 
              type="checkbox" 
              checked={formData.isEnabled}
              onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
              style={{width: '18px', height: '18px', accentColor: 'var(--brand-orange)'}}
            />
            Show Field on Form (Enabled)
          </label>

          <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}}>
            <input 
              type="checkbox" 
              checked={formData.isRequired}
              onChange={e => setFormData({ ...formData, isRequired: e.target.checked })}
              style={{width: '18px', height: '18px', accentColor: 'var(--brand-orange)'}}
            />
            Mandatory Field (* Required)
          </label>
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnPrimary" style={{borderRadius: '24px'}}>
            <Save size={16} /> Save Field Config
          </button>
        </div>
      </form>
    </Modal>
  );
}
