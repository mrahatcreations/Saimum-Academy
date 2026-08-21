'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Printer, 
  FileCheck,
  User,
  MapPin,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { publicApi } from '@/services/api';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { BangladeshAddressPicker } from '@/components/ui/BangladeshAddressPicker';
import type { AdmissionSession, Registration } from '@/types/admission';
import styles from './apply.module.css';

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);

  // Lookups data
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);

  // Form State
  const [sessionId, setSessionId] = useState('');
  const [branchName, setBranchName] = useState('Dhaka Central');
  const [departmentName, setDepartmentName] = useState('Music');
  const [subjectName, setSubjectName] = useState('Vocal Music');

  // Step 2: Personal Info
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [dob, setDob] = useState('2008-01-01');
  const [bloodGroup, setBloodGroup] = useState('A+');

  // Step 3: Guardian & Address
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherName, setMotherName] = useState('');
  const [address, setAddress] = useState({
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    addressLine: ''
  });

  // Step 4: Academic / Cultural
  const [institution, setInstitution] = useState('');
  const [currentClass, setCurrentClass] = useState('');
  const [previousTraining, setPreviousTraining] = useState('');

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash / Desk'>('bKash');
  const [trxId, setTrxId] = useState('');

  useEffect(() => {
    Promise.all([
      publicApi.getSessions(),
      publicApi.getLookups()
    ]).then(([sessRes, lookupsRes]) => {
      if (sessRes.success && sessRes.data.length > 0) {
        setSessions(sessRes.data);
        const active = sessRes.data.find((s: AdmissionSession) => s.isActive) || sessRes.data[0];
        setSessionId(active?.id || '');
      }

      if (lookupsRes.success) {
        setBranches(lookupsRes.branches || []);
        setDepartments(lookupsRes.departments || []);
        setSubjects(lookupsRes.subjects || []);

        if (lookupsRes.branches?.length > 0) setBranchName(lookupsRes.branches[0].name);
        if (lookupsRes.departments?.length > 0) setDepartmentName(lookupsRes.departments[0].name);
        if (lookupsRes.subjects?.length > 0) setSubjectName(lookupsRes.subjects[0].name);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameEn.trim() || !phone.trim()) {
      alert('Please fill in required fields.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        sessionId: sessionId || undefined,
        branchName,
        departmentName,
        subjectName,
        person: {
          fullNameEn: fullNameEn.trim(),
          fullNameBn: fullNameBn.trim() || undefined,
          phone: phone.trim(),
          email: email.trim() || undefined,
          dob,
          gender,
          bloodGroup,
          fatherName: fatherName.trim() || undefined,
          fatherPhone: fatherPhone.trim() || undefined,
          motherName: motherName.trim() || undefined,
          presentAddressDivision: address.division,
          presentAddressDistrict: address.district,
          presentAddressThana: address.thana,
          presentAddressLine: address.addressLine,
          academicInstitution: institution.trim() || undefined,
          currentClass: currentClass.trim() || undefined,
          previousCulturalTraining: previousTraining.trim() || undefined
        },
        payment: {
          status: 'PAID',
          amount: 200,
          method: paymentMethod,
          transactionId: trxId || `TXN-${Date.now().toString().slice(-6)}`
        }
      };

      const res = await publicApi.submitApplication(payload);

      if (res.success) {
        setCreatedRegistration(res.data);
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      } else {
        alert(res.message || 'Failed to submit application.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network error occurred while submitting.';
      console.error('Submission failed:', err);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === sessionId);

  if (isSuccess && createdRegistration) {
    return (
      <div className={styles.applyWrapper}>
        <div className={styles.successCard}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-success)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-bangla)', fontSize: '1.8rem', fontWeight: 800 }}>
            ভর্তি আবেদন সফলভাবে সম্পন্ন হয়েছে!
          </h2>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', fontSize: '0.90rem' }}>
            আপনার রেজিস্ট্রেশন কোডটি সংরক্ষণ করুন। প্রাথমিক যাচাই বাছাই ও ভাইভার সময়সূচী আপনার মোবাইলে এসএমএস-এর মাধ্যমে জানিয়ে দেওয়া হবে।
          </p>

          <div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Your Registration Number
            </span>
            <div className={styles.regCodeBadge}>
              {createdRegistration.registrationNo}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '16px 20px',
            width: '100%',
            textAlign: 'left',
            fontSize: '0.84rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div><strong>Applicant:</strong> {createdRegistration.person?.fullNameEn}</div>
            <div><strong>Discipline:</strong> {createdRegistration.subjectName || subjectName} ({createdRegistration.departmentName || departmentName})</div>
            <div><strong>Campus:</strong> {createdRegistration.branchName || branchName}</div>
            <div><strong>Fee Status:</strong> ৳200 BDT (Paid via {paymentMethod})</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className={styles.btnPrimary}
            >
              <Printer size={16} /> Print Application Slip
            </button>
            <Link href={`/track?q=${createdRegistration.registrationNo}`} className={styles.btnSecondary}>
              <FileCheck size={16} /> View Status Tracker
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.applyWrapper}>
      
      {/* Page Header */}
      <div className={styles.headerBox}>
        <span className={styles.preTitle}>Online Admission Portal</span>
        <h1 className={styles.title}>সেন্ট্রাল একাডেমি ভর্তি আবেদন</h1>
        <p className={styles.desc}>
          সাইমুম শিল্পীগোষ্ঠী কেন্দ্রীয় সাংস্কৃতিক একাডেমিতে ভর্তির জন্য নিচের ৫টি ধাপ সম্পন্ন করুন।
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className={styles.stepperBar}>
        {[
          { step: 1, label: 'Intake & Branch' },
          { step: 2, label: 'Personal Info' },
          { step: 3, label: 'Address & Guardian' },
          { step: 4, label: 'Experience' },
          { step: 5, label: 'Payment' }
        ].map(item => {
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <div 
              key={item.step} 
              className={styles.stepItem}
              onClick={() => {
                if (item.step < currentStep) setCurrentStep(item.step);
              }}
            >
              <div className={`${styles.stepCircle} ${isActive ? styles.stepCircleActive : ''} ${isDone ? styles.stepCircleDone : ''}`}>
                {isDone ? '✓' : item.step}
              </div>
              <span className={styles.stepLabel}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Multi-Step Form */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        
        {/* Step 1: Session, Branch & Discipline */}
        {currentStep === 1 && (
          <>
            <div className={styles.stepTitleRow}>
              <BookOpen size={18} color="var(--brand-orange)" />
              <h3 className={styles.stepTitle}>ধাপ ১: ভর্তি সেশন, শাখা ও সাংস্কৃতিক বিভাগ</h3>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Admission Intake Circular*</label>
              <CustomSelect
                options={sessions.map(s => ({
                  value: s.id,
                  label: `${s.title} (${s.year})`
                }))}
                value={sessionId}
                onChange={setSessionId}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Campus / Branch*</label>
                <CustomSelect
                  options={branches.length > 0 ? branches.map(b => ({ value: b.name, label: b.name })) : [
                    { value: 'Dhaka Central', label: 'Dhaka Central (Main Campus)' },
                    { value: 'Mirpur Branch', label: 'Mirpur Branch' },
                    { value: 'Online Branch', label: 'Online Global Branch (Zoom)' }
                  ]}
                  value={branchName}
                  onChange={setBranchName}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Department*</label>
                <CustomSelect
                  options={departments.length > 0 ? departments.map(d => ({ value: d.name, label: d.name })) : [
                    { value: 'Music', label: 'Music Department' },
                    { value: 'Drama', label: 'Drama & Acting Department' },
                    { value: 'Recitation', label: 'Recitation Department' }
                  ]}
                  value={departmentName}
                  onChange={setDepartmentName}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Master Subject / Course*</label>
              <CustomSelect
                options={subjects.length > 0 ? subjects.map(s => ({ value: s.name, label: s.name })) : [
                  { value: 'Vocal Music', label: 'Vocal Music (কন্ঠ সংগীত)' },
                  { value: 'Junior Music', label: 'Junior Music (শিশু সংগীত)' },
                  { value: 'Acting & Drama', label: 'Acting & Drama (নাট্য অভিনয়)' },
                  { value: 'Recitation', label: 'Recitation & Elocution (আবৃত্তি)' }
                ]}
                value={subjectName}
                onChange={setSubjectName}
              />
            </div>

            <div className={styles.formActions}>
              <div />
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCurrentStep(2)}
              >
                Next Step <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Personal Profile */}
        {currentStep === 2 && (
          <>
            <div className={styles.stepTitleRow}>
              <User size={18} color="var(--brand-orange)" />
              <h3 className={styles.stepTitle}>ধাপ ২: শিক্ষার্থীর ব্যক্তিগত তথ্য</h3>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name (English)*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdullah Al Mamun"
                  value={fullNameEn}
                  onChange={e => setFullNameEn(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name (বাংলা)</label>
                <input
                  type="text"
                  placeholder="যেমন: আব্দুল্লাহ আল মামুন"
                  value={fullNameBn}
                  onChange={e => setFullNameBn(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Phone Number*</label>
                <input
                  type="tel"
                  required
                  placeholder="01700-000000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Gender*</label>
                <CustomSelect
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' }
                  ]}
                  value={gender}
                  onChange={(val) => setGender(val as 'MALE' | 'FEMALE')}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date of Birth*</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Blood Group</label>
                <CustomSelect
                  options={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' },
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' }
                  ]}
                  value={bloodGroup}
                  onChange={(val) => setBloodGroup(val)}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  if (!fullNameEn.trim() || !phone.trim()) {
                    alert('Please enter Name and Phone number.');
                    return;
                  }
                  setCurrentStep(3);
                }}
              >
                Next Step <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Guardian & Cascading Address */}
        {currentStep === 3 && (
          <>
            <div className={styles.stepTitleRow}>
              <MapPin size={18} color="var(--brand-orange)" />
              <h3 className={styles.stepTitle}>ধাপ ৩: অভিভাবকের তথ্য ও ঠিকানা</h3>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Father Name</label>
                <input
                  type="text"
                  placeholder="Father's full name"
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Mother Name</label>
                <input
                  type="text"
                  placeholder="Mother's full name"
                  value={motherName}
                  onChange={e => setMotherName(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Father / Guardian Phone</label>
                <input
                  type="tel"
                  placeholder="01800-000000"
                  value={fatherPhone}
                  onChange={e => setFatherPhone(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>

            {/* Cascading Address Picker */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Present Address</label>
              <BangladeshAddressPicker
                value={address}
                onChange={setAddress}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCurrentStep(4)}
              >
                Next Step <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* Step 4: Academic & Cultural Experience */}
        {currentStep === 4 && (
          <>
            <div className={styles.stepTitleRow}>
              <Sparkles size={18} color="var(--brand-orange)" />
              <h3 className={styles.stepTitle}>ধাপ ৪: শিক্ষা প্রতিষ্ঠান ও পূর্ব সাংস্কৃতিক অভিজ্ঞতা</h3>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Current School / College / University</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka College"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className={styles.textInput}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Class / Grade / Year</label>
                <input
                  type="text"
                  placeholder="e.g. Class 9 / H.S.C"
                  value={currentClass}
                  onChange={e => setCurrentClass(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Previous Cultural Training / Background (If Any)</label>
              <input
                type="text"
                placeholder="যেমন: পূর্বে ২ বছর গান শিখেছি / বাদ্যযন্ত্র বাজাতে পারি"
                value={previousTraining}
                onChange={e => setPreviousTraining(e.target.value)}
                className={styles.textInput}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCurrentStep(5)}
              >
                Proceed to Payment <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}

        {/* Step 5: Fee Payment & Final Submit */}
        {currentStep === 5 && (
          <>
            <div className={styles.stepTitleRow}>
              <CreditCard size={18} color="var(--brand-orange)" />
              <h3 className={styles.stepTitle}>ধাপ ৫: আবেদন ফি পরিশোধ ও সাবমিশন</h3>
            </div>

            <div className={styles.paymentBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Total Application Fee:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-orange)' }}>
                  ৳{selectedSession?.applicationFee || 200} BDT
                </span>
              </div>

              <div className={styles.paymentOptions}>
                {[
                  { id: 'bKash', name: 'bKash Payment' },
                  { id: 'Nagad', name: 'Nagad Payment' },
                  { id: 'Cash / Desk', name: 'Cash at Campus' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    className={`${styles.payCard} ${paymentMethod === opt.id ? styles.payCardSelected : ''}`}
                    onClick={() => setPaymentMethod(opt.id as 'bKash' | 'Nagad' | 'Cash / Desk')}
                  >
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>

              {paymentMethod !== 'Cash / Desk' && (
                <div className={styles.fieldGroup} style={{ marginTop: '10px' }}>
                  <label className={styles.label}>Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9J2K8L10"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    className={styles.textInput}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                    * সেন্ড মানি / পেমেন্ট করার পর প্রাপ্ত ট্রানজেকশন কোড লিখুন।
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setCurrentStep(4)}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Application'}
              </button>
            </div>
          </>
        )}

      </form>

    </div>
  );
}
