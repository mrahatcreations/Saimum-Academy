import { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  GraduationCap, 
  MessageSquare, 
  ShieldCheck, 
  Save, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { PageHeader } from '../components/ui/PageHeader';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'ADMISSION' | 'ACADEMIC' | 'SMS' | 'SECURITY'>('GENERAL');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. General Academy Settings State
  const [generalForm, setGeneralForm] = useState({
    academyNameEn: 'Saimum Central Academy',
    academyNameBn: 'সাইমুম শিল্পীগোষ্ঠী কেন্দ্রীয় একাডেমি',
    tagline: 'Excellence in Islamic Art & Cultural Training',
    email: 'info@saimumacademy.com',
    phone: '+880 1700-000000',
    address: 'Central Headquarters, Dhaka, Bangladesh',
    currency: 'BDT (৳)',
    timezone: 'Asia/Dhaka (GMT+6)'
  });

  // 2. Admission Configuration State
  const [admissionForm, setAdmissionForm] = useState({
    activeSession: '2026 Intake',
    applicationFee: 200,
    allowOnlinePayment: true,
    enablePublicRegistration: true,
    vivaAutoPassScore: 70,
    workshopSelectionQuota: 50
  });

  // 3. Academic & Grading Settings State
  const [academicForm, setAcademicForm] = useState({
    minAttendancePercent: 75,
    workshopExamPassMark: 60,
    maxVivaScore: 100,
    autoEnrollToRegular: true,
    gradingScale: 'LETTER_GRADE'
  });

  // 4. SMS & Notification State
  const [smsForm, setSmsForm] = useState({
    provider: 'Greenweb SMS Gateway',
    senderId: 'SAIMUM',
    apiKey: '••••••••••••••••••••••••••••••••',
    smsOnAdmission: true,
    smsOnVivaSchedule: true,
    smsOnSelection: true
  });

  // 5. Security State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false,
    sessionTimeoutMins: 60
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', paddingBottom: '48px' }}>
      {/* 1. Standard Page Header without Subtitles or Counts */}
      <PageHeader 
        title="Settings" 
        actions={
          <Button 
            variant="primary" 
            icon={<Save size={15} />}
            loading={isSaving}
            onClick={handleSave}
          >
            Save All Settings
          </Button>
        }
      />

      {/* 2. Success Alert */}
      {saveSuccess && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#062817',
          borderRadius: '12px',
          color: '#34D399',
          fontSize: '0.84rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> All configuration settings saved and published successfully!
        </div>
      )}

      {/* 3. Settings Navigation Tabs */}
      <div style={{ margin: '4px 0' }}>
        <SegmentedTabs 
          options={[
            { id: 'GENERAL', label: 'General Profile', icon: <Building2 size={14} /> },
            { id: 'ADMISSION', label: 'Admission & Intake', icon: <UserPlus size={14} /> },
            { id: 'ACADEMIC', label: 'Academic & Grading', icon: <GraduationCap size={14} /> },
            { id: 'SMS', label: 'SMS & Alerts', icon: <MessageSquare size={14} /> },
            { id: 'SECURITY', label: 'Security & Auth', icon: <ShieldCheck size={14} /> }
          ]}
          value={activeTab}
          onChange={(val) => setActiveTab(val as any)}
        />
      </div>

      {/* 4. Settings Card Content */}
      <div className="section" style={{ padding: '28px' }}>
        {/* Tab 1: General Profile */}
        {activeTab === 'GENERAL' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Institution Identity</h3>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Primary academy names and official contact channels for official certificates and receipts.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Academy Name (English)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={generalForm.academyNameEn}
                  onChange={e => setGeneralForm({ ...generalForm, academyNameEn: e.target.value })}
                />
              </div>

              <div className="formGroup">
                <label className="label">Academy Name (Bengali)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={generalForm.academyNameBn}
                  onChange={e => setGeneralForm({ ...generalForm, academyNameBn: e.target.value })}
                />
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Official Tagline / Motto</label>
              <input 
                type="text" 
                className="input" 
                value={generalForm.tagline}
                onChange={e => setGeneralForm({ ...generalForm, tagline: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Official Support Email</label>
                <input 
                  type="email" 
                  className="input" 
                  value={generalForm.email}
                  onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                />
              </div>

              <div className="formGroup">
                <label className="label">Central Helpline Phone</label>
                <input 
                  type="text" 
                  className="input" 
                  value={generalForm.phone}
                  onChange={e => setGeneralForm({ ...generalForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Headquarters Physical Address</label>
              <input 
                type="text" 
                className="input" 
                value={generalForm.address}
                onChange={e => setGeneralForm({ ...generalForm, address: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Admission & Intake */}
        {activeTab === 'ADMISSION' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admission Policy & Intake Controls</h3>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Manage admission fee amounts, active intake cohorts, and automatic viva thresholds.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Active Intake Session</label>
                <input 
                  type="text" 
                  className="input" 
                  value={admissionForm.activeSession}
                  onChange={e => setAdmissionForm({ ...admissionForm, activeSession: e.target.value })}
                />
              </div>

              <div className="formGroup">
                <label className="label">Application Fee Amount (৳ BDT)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={admissionForm.applicationFee}
                  onChange={e => setAdmissionForm({ ...admissionForm, applicationFee: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Viva Auto-Selection Score (Out of 100)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={admissionForm.vivaAutoPassScore}
                  onChange={e => setAdmissionForm({ ...admissionForm, vivaAutoPassScore: Number(e.target.value) })}
                />
              </div>

              <div className="formGroup">
                <label className="label">Workshop Target Batch Size</label>
                <input 
                  type="number" 
                  className="input" 
                  value={admissionForm.workshopSelectionQuota}
                  onChange={e => setAdmissionForm({ ...admissionForm, workshopSelectionQuota: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academic & Grading */}
        {activeTab === 'ACADEMIC' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Academic Rules & Progression</h3>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Minimum attendance percentages and workshop graduation thresholds.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Minimum Attendance Required (%)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={academicForm.minAttendancePercent}
                  onChange={e => setAcademicForm({ ...academicForm, minAttendancePercent: Number(e.target.value) })}
                />
              </div>

              <div className="formGroup">
                <label className="label">Workshop Exam Passing Mark (%)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={academicForm.workshopExamPassMark}
                  onChange={e => setAcademicForm({ ...academicForm, workshopExamPassMark: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SMS Gateway */}
        {activeTab === 'SMS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>SMS Gateway Configuration</h3>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Automated SMS alerts for applicants, viva scheduling, and workshop invitations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">SMS Gateway Service</label>
                <select 
                  className="select"
                  value={smsForm.provider}
                  onChange={e => setSmsForm({ ...smsForm, provider: e.target.value })}
                >
                  <option value="Greenweb SMS Gateway">Greenweb SMS Gateway (Bangladesh)</option>
                  <option value="BulkSMS BD">BulkSMS BD</option>
                  <option value="Banglalink Gateway">Banglalink Enterprise</option>
                </select>
              </div>

              <div className="formGroup">
                <label className="label">Masking / Sender ID</label>
                <input 
                  type="text" 
                  className="input" 
                  value={smsForm.senderId}
                  onChange={e => setSmsForm({ ...smsForm, senderId: e.target.value })}
                />
              </div>
            </div>

            <div className="formGroup">
              <label className="label">API Authentication Key</label>
              <input 
                type="password" 
                className="input" 
                value={smsForm.apiKey}
                onChange={e => setSmsForm({ ...smsForm, apiKey: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Tab 5: Security & Password */}
        {activeTab === 'SECURITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin Password & Access Security</h3>
              <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Update administrative credentials and configure session timeout durations.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="formGroup">
                <label className="label">Current Password</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="Enter current password"
                  value={securityForm.currentPassword}
                  onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="formGroup">
                <label className="label">New Master Password</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="Min. 8 characters"
                  value={securityForm.newPassword}
                  onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Session Auto-Lock Duration (Minutes)</label>
              <input 
                type="number" 
                className="input" 
                value={securityForm.sessionTimeoutMins}
                onChange={e => setSecurityForm({ ...securityForm, sessionTimeoutMins: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
