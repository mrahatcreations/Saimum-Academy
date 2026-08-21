import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import type { Registration, AdmissionSession } from '../../types/admission';
import { 
  User, 
  BookOpen, 
  MapPin, 
  GraduationCap, 
  Receipt, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import BangladeshAddressPicker from '../ui/BangladeshAddressPicker';
import type { AddressValue } from '../ui/BangladeshAddressPicker';

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmission: (newReg: Registration) => void;
  existingRegistrations?: Registration[];
  sessions?: AdmissionSession[];
}

export default function NewAdmissionModal({ 
  isOpen, 
  onClose, 
  onAddAdmission,
  existingRegistrations = [],
  sessions = []
}: NewAdmissionModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Active Session Resolution
  const activeSessionObj = sessions.find(s => s.isActive) || sessions[0];
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSessionObj?.id || '');

  // Update session ID when modal opens or sessions load
  useEffect(() => {
    if (activeSessionObj && !selectedSessionId) {
      setSelectedSessionId(activeSessionObj.id);
    }
  }, [sessions, activeSessionObj]);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || activeSessionObj;

  // --- Step 1: Core Identity Fields ---
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [nidBirthCert, setNidBirthCert] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherName, setMotherName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');

  // --- Step 2: Program & Course ---
  const [branch, setBranch] = useState('Dhaka Central');
  const [department, setDepartment] = useState('Music Department');
  const [subject, setSubject] = useState('Vocal Music');

  // --- Step 3: Addresses & Emergency Contact ---
  const [presentAddress, setPresentAddress] = useState<AddressValue>({
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Mirpur',
    addressLine: ''
  });
  const [permanentAddress, setPermanentAddress] = useState<AddressValue>({
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Mirpur',
    addressLine: ''
  });
  const [sameAsPresent, setSameAsPresent] = useState(true);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Father');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // --- Step 4: Academic Background & Custom ---
  const [institution, setInstitution] = useState('');
  const [currentClass, setCurrentClass] = useState('Class 5');
  const [previousTraining, setPreviousTraining] = useState('');
  const [tshirtSize, setTshirtSize] = useState('M (38)');

  // --- Step 5: Payment Method ---
  const [paymentMethod, setPaymentMethod] = useState<'Cash / Desk' | 'bKash' | 'Nagad'>('Cash / Desk');

  if (!isOpen) return null;

  // Internal silent matching of Person record
  const getMatchedPersonId = () => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanNid = nidBirthCert.trim();

    const match = existingRegistrations.find(r => {
      if (cleanNid && r.person.nidBirthCert && r.person.nidBirthCert.trim() === cleanNid) return true;
      if (cleanPhone && r.person.phone.replace(/[^0-9]/g, '') === cleanPhone && r.person.dob === dob) return true;
      if (r.person.fullNameEn.toLowerCase().trim() === fullNameEn.toLowerCase().trim() && r.person.fatherName.toLowerCase().trim() === fatherName.toLowerCase().trim()) return true;
      return false;
    });

    return match ? match.person.id : null;
  };

  // Step Navigation Validators
  const handleNext = () => {
    if (currentStep === 1) {
      if (!fullNameEn.trim() || !dob || !phone.trim() || !fatherName.trim() || !motherName.trim()) {
        alert('Please fill in Applicant Name, Date of Birth, Mobile, and Parent Names correctly.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!presentAddress.addressLine.trim()) {
        alert('Please fill in the Street Address / House details.');
        return;
      }
    }
    setCurrentStep((prev) => (prev < 5 ? ((prev + 1) as any) : prev));
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedId = getMatchedPersonId();
    const effectivePersonId = matchedId || ('per-' + Date.now());

    const prefix = currentSession?.regPrefix || 'SA-2026-';
    const startNum = currentSession?.regStartNumber || 1001;
    const counter = currentSession?.regCounter || 0;
    const regNo = `${prefix}${startNum + counter}`;
    const finalPermanentAddress = sameAsPresent ? presentAddress : permanentAddress;

    const newRegistration: Registration = {
      id: 'reg-' + Date.now(),
      registrationNo: regNo,
      personId: effectivePersonId,
      sessionId: currentSession?.id,
      sessionTitle: currentSession?.title,
      sessionCode: currentSession?.sessionCode,
      person: {
        id: effectivePersonId,
        fullNameEn,
        fullNameBn: fullNameBn || fullNameEn,
        phone,
        email,
        dob,
        gender,
        bloodGroup,
        nidBirthCert,
        presentAddress: {
          division: presentAddress.division || 'Dhaka',
          district: presentAddress.district,
          thana: presentAddress.thana,
          addressLine: presentAddress.addressLine,
        },
        permanentAddress: {
          division: finalPermanentAddress.division || 'Dhaka',
          district: finalPermanentAddress.district,
          thana: finalPermanentAddress.thana,
          addressLine: finalPermanentAddress.addressLine,
        },
        fatherName,
        fatherPhone: fatherPhone || phone,
        motherName,
        emergencyContact: {
          name: emergencyName || `${fatherName} (${emergencyRelation})`,
          relation: emergencyRelation,
          phone: emergencyPhone || fatherPhone || phone,
        },
        academicInstitution: institution,
        currentClass,
        previousCulturalTraining: previousTraining
      },
      branchId: branch === 'Mirpur Branch' ? 'br-02' : branch.includes('Online') ? 'br-03' : 'br-01',
      branchName: branch,
      branchType: branch.includes('Online') ? 'ONLINE' : 'PHYSICAL',
      departmentId: department.includes('Acting') ? 'dept-02' : department.includes('Recitation') ? 'dept-03' : 'dept-01',
      departmentName: department,
      subjectId: subject.includes('Junior') ? 'sub-02' : subject.includes('Acting') ? 'sub-03' : subject.includes('Recitation') ? 'sub-04' : 'sub-01',
      subjectName: subject,
      applicationYear: currentSession?.year || new Date().getFullYear(),
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'PENDING_VIVA',
      payment: {
        amount: currentSession?.applicationFee || 200,
        status: 'PAID',
        method: paymentMethod,
        transactionId: paymentMethod === 'Cash / Desk' ? `CASH-${Math.floor(100000 + Math.random() * 900000)}` : `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: new Date().toISOString().split('T')[0]
      }
    };

    onAddAdmission(newRegistration);
    onClose();
  };

  const stepsList = [
    { num: 1, label: 'Identity', icon: User },
    { num: 2, label: 'Program', icon: BookOpen },
    { num: 3, label: 'Address', icon: MapPin },
    { num: 4, label: 'Academic', icon: GraduationCap },
    { num: 5, label: 'Payment', icon: Receipt },
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="New Candidate Admission (Desk Entry)"
      size="xl"
    >
      {/* 5-Step Stepper Header */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        padding: '0 8px',
        position: 'relative'
      }}>
        {stepsList.map((st) => {
          const IconComp = st.icon;
          const isActive = currentStep === st.num;
          const isCompleted = currentStep > st.num;

          return (
            <div 
              key={st.num}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2,
                cursor: st.num < currentStep ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (st.num < currentStep) setCurrentStep(st.num as any);
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#10B981' : isActive ? 'var(--brand-orange)' : 'var(--bg-body)',
                color: (isCompleted || isActive) ? 'white' : 'var(--text-secondary)',
                border: isActive ? '2px solid var(--brand-orange)' : '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}>
                {isCompleted ? <CheckCircle2 size={18} /> : <IconComp size={16} />}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? 'var(--brand-orange)' : isCompleted ? 'var(--text-primary)' : 'var(--text-tertiary)'
              }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* =========================================================================
            STEP 1: CORE IDENTITY DETAILS
           ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px'}}>
              Step 1: Applicant Basic Identity
            </h4>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">Full Name (English)*</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter full name in English" 
                  required
                  value={fullNameEn}
                  onChange={e => setFullNameEn(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Full Name (Bengali)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="বাংলা নাম (ঐচ্ছিক)" 
                  value={fullNameBn}
                  onChange={e => setFullNameBn(e.target.value)}
                />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">Date of Birth*</label>
                <input 
                  type="date" 
                  className="input" 
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Gender*</label>
                <select 
                  className="select" 
                  value={gender} 
                  onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE')}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">Applicant Phone Number*</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="01XXXXXXXXX" 
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Birth Certificate / NID No.</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter Birth Reg or NID number" 
                  value={nidBirthCert}
                  onChange={e => setNidBirthCert(e.target.value)}
                />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">Father's Name*</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter father's name" 
                  required
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Mother's Name*</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter mother's name" 
                  required
                  value={motherName}
                  onChange={e => setMotherName(e.target.value)}
                />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">Father's Mobile</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="01XXXXXXXXX" 
                  value={fatherPhone}
                  onChange={e => setFatherPhone(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Applicant Email</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Blood Group</label>
                <select 
                  className="select" 
                  value={bloodGroup} 
                  onChange={e => setBloodGroup(e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: BRANCH, DEPARTMENT, MASTER SUBJECT & INTAKE SESSION
           ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px'}}>
              Step 2: Admission Session & Course Selection
            </h4>

            {/* Session Selector */}
            {sessions.length > 0 && (
              <div className="formGroup" style={{
                backgroundColor: 'var(--bg-body)',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px'
              }}>
                <label className="label" style={{fontWeight: 800, color: 'var(--brand-orange)'}}>
                  Target Intake Session / Circular*
                </label>
                <select 
                  className="select" 
                  value={selectedSessionId} 
                  onChange={e => setSelectedSessionId(e.target.value)}
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.sessionCode}) — ৳{s.applicationFee} BDT {s.isActive ? '● Live' : ''}
                    </option>
                  ))}
                </select>
                <div style={{fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                  Assigned ID Format: <strong>{currentSession?.regPrefix || 'SA-2026-'}{Number(currentSession?.regStartNumber || 1001) + Number(currentSession?.regCounter || 0)}</strong> • Application Fee: <strong>৳{currentSession?.applicationFee || 200} BDT</strong>
                </div>
              </div>
            )}

            <div className="formGroup">
              <label className="label">Branch Selection*</label>
              <select className="select" value={branch} onChange={e => setBranch(e.target.value)}>
                <option value="Dhaka Central">Dhaka Central (Physical Branch)</option>
                <option value="Mirpur Branch">Mirpur Branch (Physical Branch)</option>
                <option value="Online Academy">Online Academy (Live Zoom Class)</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="label">Department*</label>
              <select className="select" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="Music Department">Music Department</option>
                <option value="Acting & Drama Department">Acting & Drama Department</option>
                <option value="Recitation Department">Recitation Department</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="label">Master Subject / Course*</label>
              <select className="select" value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="Vocal Music">Vocal Music</option>
                <option value="Junior Music">Junior Music</option>
                <option value="Acting & Drama">Acting & Drama</option>
                <option value="Recitation & Elocution">Recitation & Elocution</option>
              </select>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: ADDRESSES & EMERGENCY CONTACT
           ========================================================================= */}
        {currentStep === 3 && (
          <div>
            <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px'}}>
              Step 3: Residential & Permanent Addresses
            </h4>

            {/* Present Address using Bangladesh Geographic Dataset */}
            <BangladeshAddressPicker 
              label="Present Residential Address"
              value={presentAddress}
              onChange={setPresentAddress}
              required
            />

            {/* Same As Present Checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '12px 0 16px',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-body)',
              borderRadius: '10px',
              border: '1px solid var(--border-light)'
            }}>
              <input 
                type="checkbox" 
                id="sameAsPresentModal"
                checked={sameAsPresent}
                onChange={e => setSameAsPresent(e.target.checked)}
                style={{width: '18px', height: '18px', accentColor: 'var(--brand-orange)', cursor: 'pointer'}}
              />
              <label htmlFor="sameAsPresentModal" style={{fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer'}}>
                Permanent Address is the same as Present Address
              </label>
            </div>

            {/* Permanent Address */}
            {!sameAsPresent && (
              <BangladeshAddressPicker 
                label="Permanent Address"
                value={permanentAddress}
                onChange={setPermanentAddress}
                required
              />
            )}

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '14px'}}>
              <div className="formGroup">
                <label className="label">Emergency Contact Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Contact person name"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Relation</label>
                <select 
                  className="select" 
                  value={emergencyRelation} 
                  onChange={e => setEmergencyRelation(e.target.value)}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>
              <div className="formGroup">
                <label className="label">Emergency Mobile Number</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="01XXXXXXXXX" 
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: ACADEMIC & CULTURAL BACKGROUND
           ========================================================================= */}
        {currentStep === 4 && (
          <div>
            <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px'}}>
              Step 4: Academic Background & Experience
            </h4>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px'}}>
              <div className="formGroup">
                <label className="label">School / Institution Name*</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter school, college, or university name" 
                  required
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                />
              </div>
              <div className="formGroup">
                <label className="label">Current Class / Grade*</label>
                <select className="select" value={currentClass} onChange={e => setCurrentClass(e.target.value)}>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="HSC / College">HSC / College</option>
                  <option value="Honours / University">Honours / University</option>
                </select>
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Previous Cultural / Training Experience</label>
              <textarea 
                className="input" 
                rows={2} 
                placeholder="Mention any previous music, drama, or recitation experience..."
                value={previousTraining}
                onChange={e => setPreviousTraining(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label className="label">Workshop T-Shirt Size</label>
              <select className="select" value={tshirtSize} onChange={e => setTshirtSize(e.target.value)}>
                <option value="Kids (32)">Kids (32)</option>
                <option value="Kids (34)">Kids (34)</option>
                <option value="S (36)">S (36)</option>
                <option value="M (38)">M (38)</option>
                <option value="L (40)">L (40)</option>
                <option value="XL (42)">XL (42)</option>
                <option value="XXL (44)">XXL (44)</option>
              </select>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: REVIEW & PAYMENT SUBMISSION
           ========================================================================= */}
        {currentStep === 5 && (
          <div>
            <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px'}}>
              Step 5: Review & Registration Fee
            </h4>

            {/* Summary Review Card */}
            <div style={{
              backgroundColor: 'var(--bg-body)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Applicant Name:</span>
                <strong>{fullNameEn}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Selected Branch:</span>
                <strong>{branch}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Course / Subject:</span>
                <strong>{subject}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Mobile Number:</span>
                <strong>{phone}</strong>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Present Address:</span>
                <span>{presentAddress.addressLine}, {presentAddress.thana}, {presentAddress.district}</span>
              </div>
            </div>

            {/* Fee Card */}
            <div style={{
              backgroundColor: 'var(--bg-body)',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)'}}>
                  Application Fee: ৳ 200/- BDT
                </div>
                <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)'}}>
                  Payable at Desk or via Digital Gateway
                </div>
              </div>

              <select 
                className="select" 
                style={{padding: '6px 12px', fontSize: '0.85rem', width: 'auto'}}
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
              >
                <option value="Cash / Desk">Cash / Office Desk</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
              </select>
            </div>
          </div>
        )}

        {/* --- Form Footer Navigation Actions --- */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <div>
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btnCancel" 
                onClick={handleBack}
                style={{display: 'inline-flex', alignItems: 'center', gap: '6px'}}
              >
                <ChevronLeft size={16} /> Back Step
              </button>
            )}
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <button type="button" className="btnCancel" onClick={onClose}>
              Cancel
            </button>

            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btnPrimary" 
                onClick={handleNext}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btnPrimary" 
                style={{ backgroundColor: '#10B981' }}
              >
                <FileCheck size={16} /> Complete Admission & Generate Slip
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
