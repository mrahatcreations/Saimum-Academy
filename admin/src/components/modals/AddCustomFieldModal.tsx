import React, { useState } from 'react';
import Modal from '../ui/Modal';
import type { FormFieldConfig, FormSection, FieldType } from '../../types/formBuilder';
import { PlusCircle } from 'lucide-react';

interface AddCustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (newField: FormFieldConfig) => void;
}

export default function AddCustomFieldModal({
  isOpen,
  onClose,
  onAddField
}: AddCustomFieldModalProps) {
  const [section, setSection] = useState<FormSection>('CUSTOM');
  const [labelEn, setLabelEn] = useState('');
  const [labelBn, setLabelBn] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('TEXT');
  const [placeholder, setPlaceholder] = useState('');
  const [helpText, setHelpText] = useState('');
  const [optionsStr, setOptionsStr] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fieldName = labelEn.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const options = optionsStr.trim() ? optionsStr.split(',').map(o => o.trim()).filter(Boolean) : undefined;

    const newField: FormFieldConfig = {
      id: 'fld-' + Date.now(),
      section,
      fieldName,
      labelEn,
      labelBn: labelBn || labelEn,
      fieldType,
      options,
      placeholder: placeholder || undefined,
      helpText: helpText || undefined,
      isEnabled: true,
      isRequired,
      isSystemField: false,
      sortOrder: 99
    };

    onAddField(newField);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Admission Form Field">
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div className="formGroup">
          <label className="label">Target Form Section</label>
          <select 
            className="select" 
            value={section} 
            onChange={e => setSection(e.target.value as FormSection)}
          >
            <option value="PERSONAL">Personal & Identity Details</option>
            <option value="GUARDIAN">Guardian & Emergency Contacts</option>
            <option value="ACADEMIC">Academic & Skills Background</option>
            <option value="CUSTOM">Custom Saimum Academy Questions</option>
          </select>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Field Label (English)*</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Favorite Musical Instrument" 
              required
              value={labelEn}
              onChange={e => setLabelEn(e.target.value)}
            />
          </div>
          <div className="formGroup">
            <label className="label">ফিল্ড লেবেল (বাংলায়)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="পছন্দের বাদ্যযন্ত্র" 
              value={labelBn}
              onChange={e => setLabelBn(e.target.value)}
            />
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div className="formGroup">
            <label className="label">Input Type</label>
            <select 
              className="select" 
              value={fieldType} 
              onChange={e => setFieldType(e.target.value as FieldType)}
            >
              <option value="TEXT">Single Line Text</option>
              <option value="TEXTAREA">Multi-line Text Area</option>
              <option value="NUMBER">Number</option>
              <option value="DATE">Date Picker</option>
              <option value="SELECT">Select Dropdown</option>
              <option value="RADIO">Radio Buttons</option>
              <option value="CHECKBOX">Checkbox (Agreement / Yes-No)</option>
              <option value="FILE">File / Image Upload</option>
            </select>
          </div>

          <div className="formGroup">
            <label className="label">Field Requirement</label>
            <div style={{display: 'flex', alignItems: 'center', height: '42px', gap: '8px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}}>
                <input 
                  type="checkbox" 
                  checked={isRequired}
                  onChange={e => setIsRequired(e.target.checked)}
                  style={{width: '18px', height: '18px', accentColor: 'var(--brand-orange)'}}
                />
                Mandatory Field (* Required)
              </label>
            </div>
          </div>
        </div>

        {(fieldType === 'SELECT' || fieldType === 'RADIO') && (
          <div className="formGroup">
            <label className="label">Dropdown / Radio Options (Comma Separated)*</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Harmonium, Keyboard, Tabla, Guitar, None" 
              required
              value={optionsStr}
              onChange={e => setOptionsStr(e.target.value)}
            />
            <span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block'}}>
              Separate each selectable choice with a comma (,).
            </span>
          </div>
        )}

        <div className="formGroup">
          <label className="label">Placeholder Text (Optional)</label>
          <input 
            type="text" 
            className="input" 
            placeholder="Enter name of instrument..." 
            value={placeholder}
            onChange={e => setPlaceholder(e.target.value)}
          />
        </div>

        <div className="formGroup">
          <label className="label">Help Text / Instruction (Optional)</label>
          <input 
            type="text" 
            className="input" 
            placeholder="যদি পূর্বে বাজিয়ে থাকেন তবে উল্লেখ করুন" 
            value={helpText}
            onChange={e => setHelpText(e.target.value)}
          />
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btnPrimary" style={{borderRadius: '24px'}}>
            <PlusCircle size={16} /> Add Field to Form
          </button>
        </div>
      </form>
    </Modal>
  );
}
