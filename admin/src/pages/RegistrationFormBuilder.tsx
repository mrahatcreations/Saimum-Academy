import { useState, useEffect } from 'react';
import { 
  Plus, 
  RotateCcw, 
  Save, 
  Eye, 
  Edit3, 
  Trash2, 
  BookOpen,
  User,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  GripVertical
} from 'lucide-react';
import appStyles from '../App.module.css';
import styles from './RegistrationFormBuilder.module.css';
import { defaultFormFields } from '../data/defaultFormFields';
import { formBuilderService } from '../services/formBuilderService';
import type { FormFieldConfig, FormSection } from '../types/formBuilder';
import AddCustomFieldModal from '../components/modals/AddCustomFieldModal';
import EditFieldConfigModal from '../components/modals/EditFieldConfigModal';
import Modal from '../components/ui/Modal';
import BangladeshAddressPicker from '../components/ui/BangladeshAddressPicker';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';

export default function RegistrationFormBuilder() {
  const [fields, setFields] = useState<FormFieldConfig[]>(defaultFormFields);
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | FormSection>('ALL');
  const [search, setSearch] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load from Live Backend API
  useEffect(() => {
    formBuilderService.getFields()
      .then(res => {
        if (res.success && res.data.length > 0) {
          setFields(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load fields from API, using defaults:', err);
      });
  }, []);

  // Toggle Field Enable/Disable
  const handleToggleEnable = (fieldId: string) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        return { ...f, isEnabled: !f.isEnabled };
      }
      return f;
    }));
  };

  // Toggle Required/Optional
  const handleToggleRequired = (fieldId: string) => {
    setFields(prev => prev.map(f => {
      if (f.id === fieldId) {
        return { ...f, isRequired: !f.isRequired };
      }
      return f;
    }));
  };

  // Delete Custom Field
  const handleDeleteField = (fieldId: string, label: string) => {
    if (window.confirm(`Are you sure you want to delete custom field "${label}"?`)) {
      setFields(prev => prev.filter(f => f.id !== fieldId));
    }
  };

  // Add Custom Field
  const handleAddField = (newField: FormFieldConfig) => {
    setFields([...fields, newField]);
  };

  // Update Field Config
  const handleUpdateField = (updatedField: FormFieldConfig) => {
    setFields(prev => prev.map(f => f.id === updatedField.id ? updatedField : f));
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all admission form fields to Saimum Academy standard defaults?')) {
      setFields(defaultFormFields);
      formBuilderService.saveFields(defaultFormFields);
    }
  };

  // Save and Publish Form Settings to Backend API
  const handleSaveAndPublish = async () => {
    try {
      setIsSaving(true);
      const res = await formBuilderService.saveFields(fields);
      if (res.success) {
        setSaveSuccessMsg(true);
        setTimeout(() => setSaveSuccessMsg(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save form fields:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Section Grouping Metadata
  const sections: { key: FormSection; title: string; subtitle: string; icon: any }[] = [
    { key: 'PROGRAM', title: '1. Program & Course Selection', subtitle: 'Branch, Department & Subject offerings', icon: BookOpen },
    { key: 'PERSONAL', title: '2. Personal Identification Details', subtitle: 'Name, DOB, gender, blood group & photo', icon: User },
    { key: 'GUARDIAN', title: '3. Guardian & Family Contacts', subtitle: 'Father, mother & emergency contact details', icon: ShieldAlert },
    { key: 'ACADEMIC', title: '4. Academic & Cultural Background', subtitle: 'School, grade & previous artistic training', icon: GraduationCap },
    { key: 'CUSTOM', title: '5. Custom Saimum Academy Questions', subtitle: 'Additional dynamic questions created by admin', icon: Sparkles }
  ];

  const visibleSections = activeSectionFilter === 'ALL' 
    ? sections 
    : sections.filter(s => s.key === activeSectionFilter);

  return (
    <>
      <div className={appStyles.section}>
        {/* Top Header */}
        <div className={appStyles.sectionHeader} style={{flexWrap: 'wrap', gap: '16px', marginBottom: '20px'}}>
          <div>
            <h2>Admission Form Builder</h2>
            <p style={{fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
              Configure, toggle, and customize registration fields for incoming applicants.
            </p>
          </div>

          <div style={{display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Search fields..." 
            />

            <Button 
              variant="secondary"
              icon={<RotateCcw size={14} />}
              onClick={handleResetDefaults}
              title="Reset to defaults"
            >
              Defaults
            </Button>

            <Button 
              variant="secondary"
              icon={<Eye size={14} />}
              onClick={() => setIsPreviewModalOpen(true)}
              title="Preview Form"
            >
              Preview
            </Button>

            <Button 
              variant="primary"
              icon={<Plus size={15} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Field
            </Button>

            <Button 
              variant="primary"
              icon={<Save size={14} />}
              disabled={isSaving}
              onClick={handleSaveAndPublish}
              style={{ backgroundColor: '#10B981' }}
            >
              {isSaving ? 'Saving...' : 'Save & Publish'}
            </Button>
          </div>
        </div>

        {/* Section Filter Pills using unified SegmentedTabs */}
        <div style={{ marginBottom: '24px' }}>
          <SegmentedTabs 
            options={[
              { id: 'ALL', label: 'All Sections', count: fields.length },
              ...sections.map(s => ({
                id: s.key,
                label: s.title.split('. ')[1] || s.title,
                count: fields.filter(f => f.section === s.key).length
              }))
            ]}
            value={activeSectionFilter}
            onChange={(val) => setActiveSectionFilter(val as any)}
          />
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div style={{
            margin: '0 0 20px',
            padding: '10px 16px',
            backgroundColor: '#062817',
            borderRadius: '10px',
            color: '#34D399',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} /> Form configurations saved and published successfully!
          </div>
        )}

        {/* Section Blocks Container */}
        <div className={styles.sectionList}>
          {visibleSections.map(sec => {
            let secFields = fields.filter(f => f.section === sec.key);
            
            // Search filter within section
            if (search.trim()) {
              const q = search.toLowerCase();
              secFields = secFields.filter(f => 
                f.labelEn.toLowerCase().includes(q) ||
                f.fieldName.toLowerCase().includes(q) ||
                f.fieldType.toLowerCase().includes(q) ||
                (f.helpText && f.helpText.toLowerCase().includes(q))
              );
            }

            if (secFields.length === 0 && search.trim()) return null;
            if (secFields.length === 0 && sec.key !== 'CUSTOM') return null;

            const IconComponent = sec.icon;

            return (
              <div className={styles.sectionBlock} key={sec.key}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitleGroup}>
                    <div className={styles.sectionIcon}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div className={styles.sectionTitleText}>{sec.title}</div>
                      <div style={{fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px'}}>
                        {sec.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className={styles.sectionCountBadge}>
                    {secFields.filter(f => f.isEnabled).length} of {secFields.length} active
                  </span>
                </div>

                <div className={styles.fieldRowsContainer}>
                  {secFields.map(f => {
                    const isGeo = f.fieldName === 'presentAddress' || f.fieldName === 'permanentAddress';

                    return (
                      <div 
                        key={f.id} 
                        className={`${styles.fieldRow} ${!f.isEnabled ? styles.fieldRowDisabled : ''}`}
                      >
                        <div className={styles.fieldLeft}>
                          <div className={styles.dragHandle} title="Drag to reorder">
                            <GripVertical size={15} />
                          </div>
                          <div className={styles.fieldInfoBlock}>
                            <div className={styles.labelLine}>
                              <span>{f.labelEn}</span>
                              <span className={styles.typeBadge}>
                                {isGeo ? 'GEO ADDRESS' : f.fieldType}
                              </span>
                            </div>
                            {f.helpText && (
                              <div className={styles.subLabelLine}>
                                {f.helpText}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={styles.fieldRightActions}>
                          {/* Mandatory / Optional Pill Toggle */}
                          <button 
                            type="button"
                            className={`${styles.reqToggleBtn} ${f.isRequired ? styles.reqMandatory : styles.reqOptional}`}
                            onClick={() => handleToggleRequired(f.id)}
                            title="Click to toggle Required / Optional"
                          >
                            {f.isRequired ? 'Required' : 'Optional'}
                          </button>

                          {/* Switch Toggle */}
                          <label className={styles.switchToggle} title={f.isEnabled ? 'Disable Field' : 'Enable Field'}>
                            <input 
                              type="checkbox" 
                              checked={f.isEnabled}
                              onChange={() => handleToggleEnable(f.id)}
                            />
                            <span className={styles.slider}></span>
                          </label>

                          {/* Edit Modal Trigger */}
                          <button 
                            className={styles.iconBtn} 
                            onClick={() => {
                              setEditingField(f);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Field Configuration"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete Custom Field */}
                          {!f.isSystemField && (
                            <button 
                              className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                              onClick={() => handleDeleteField(f.id, f.labelEn)}
                              title="Delete Custom Field"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {secFields.length === 0 && sec.key === 'CUSTOM' && (
                    <div style={{padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.84rem'}}>
                      No custom questions added yet. Click <strong>+ Add Field</strong> above to create one.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Field Modal */}
      <AddCustomFieldModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddField={handleAddField}
      />

      {/* Edit Field Config Modal */}
      <EditFieldConfigModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        field={editingField}
        onUpdateField={handleUpdateField}
      />

      {/* Live Form Preview Modal */}
      <Modal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        title="Live Admission Form Preview"
        size="xl"
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px', padding: '4px 0'}}>
          <p style={{fontSize: '0.84rem', color: 'var(--text-secondary)'}}>
            This is how prospective applicants will see and interact with the admission registration form.
          </p>

          {sections.map(sec => {
            const secFields = fields.filter(f => f.section === sec.key && f.isEnabled);
            if (secFields.length === 0) return null;

            return (
              <div key={sec.key} style={{
                backgroundColor: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '16px 20px'
              }}>
                <h4 style={{fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px'}}>
                  {sec.title}
                </h4>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px'}}>
                  {secFields.map(f => {
                    if (f.fieldName === 'presentAddress' || f.fieldName === 'permanentAddress') {
                      return (
                        <div key={f.id} style={{gridColumn: '1 / -1'}}>
                          <BangladeshAddressPicker 
                            label={f.labelEn}
                            value={{
                              division: 'Dhaka',
                              district: 'Dhaka',
                              thana: 'Mirpur',
                              addressLine: ''
                            }}
                            onChange={() => {}}
                            required={f.isRequired}
                          />
                        </div>
                      );
                    }

                    return (
                      <div className="formGroup" key={f.id} style={{marginBottom: 0}}>
                        <label className="label">
                          {f.labelEn} {f.isRequired && <span style={{color: '#EF4444'}}>*</span>}
                        </label>

                        {f.fieldType === 'TEXT' && (
                          <input type="text" className="input" placeholder={f.placeholder || `Enter ${f.labelEn}`} readOnly />
                        )}

                        {f.fieldType === 'DATE' && (
                          <input type="date" className="input" readOnly />
                        )}

                        {f.fieldType === 'SELECT' && (
                          <select className="select" disabled>
                            <option value="">Select {f.labelEn}...</option>
                            {f.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {f.fieldType === 'RADIO' && (
                          <div style={{display: 'flex', gap: '16px', marginTop: '6px'}}>
                            {f.options?.map((opt, i) => (
                              <label key={i} style={{fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <input type="radio" name={f.fieldName} disabled />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {f.fieldType === 'TEXTAREA' && (
                          <textarea className="input" rows={2} placeholder={f.placeholder || ''} readOnly />
                        )}

                        {f.fieldType === 'FILE' && (
                          <input type="file" className="input" disabled />
                        )}

                        {f.helpText && (
                          <span style={{fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block'}}>
                            {f.helpText}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '12px'}}>
            <button className="btnPrimary" onClick={() => setIsPreviewModalOpen(false)}>
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
