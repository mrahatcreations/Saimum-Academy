import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Edit3,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  Copy,
  Check,
  Phone,
  CreditCard,
  HeartPulse,
  UserCheck,
  Award
} from 'lucide-react';
import type { Registration } from '../../types/admission';
import { UserAvatar } from '../ui/UserAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './ApplicantProfileDrawer.module.css';

interface ApplicantProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onScheduleViva: (reg: Registration) => void;
  onUpdateStatus: (regId: string, newStatus: Registration['status']) => void;
  onEdit: (reg: Registration) => void;
  onEvaluateViva?: (reg: Registration) => void;
}

export default function ApplicantProfileDrawer({
  isOpen,
  onClose,
  registration,
  onScheduleViva,
  onUpdateStatus,
  onEdit,
  onEvaluateViva
}: ApplicantProfileDrawerProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !registration) return null;

  const { person } = registration;

  // Handle 1-click copy
  const handleCopy = (text: string, key: string) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) || age < 0 ? null : age;
  };

  const age = calculateAge(person.dob);

  // Clean names helper
  const cleanEnName = person.fullNameEn.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  const hasBengaliName = person.fullNameBn && 
    person.fullNameBn.trim() !== person.fullNameEn.trim() && 
    /[\u0980-\u09FF]/.test(person.fullNameBn);

  const cleanBnName = hasBengaliName ? person.fullNameBn.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : null;

  const getStatusBadge = (status: Registration['status']) => {
    return <StatusBadge status={status} />;
  };

  const val = (v: any) => {
    if (v === undefined || v === null || v === '' || v === 'Not provided') return '—';
    return v;
  };

  const vivaInfo = registration.viva;

  return createPortal(
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerContainer} onClick={e => e.stopPropagation()}>
        
        {/* =========================================================================
            1. PROFILE HERO BANNER & AVATAR
           ========================================================================= */}
        <div className={styles.heroCover}>
          <div className={styles.heroPatternOverlay} />
          
          {/* Top Bar on Cover */}
          <div className={styles.coverTopBar}>
            <div className={styles.sessionTag}>
              Intake: {registration.sessionTitle || 'Spring 2026'}
            </div>
            <div className={styles.coverActions}>
              <button 
                className={styles.coverBtn}
                onClick={() => onEdit(registration)}
                title="Edit Candidate Profile"
              >
                <Edit3 size={13} /> Edit
              </button>
              <button 
                className={styles.coverCloseBtn}
                onClick={onClose}
                title="Close Profile"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Floating Profile Info */}
          <div className={styles.profileHeaderBox}>
            <UserAvatar
              name={cleanEnName}
              photoUrl={person.photoUrl}
              size={68}
              shape="circle"
              style={{
                border: '1px solid var(--border-light, #e2e8f0)',
                flexShrink: 0
              }}
            />

            <div className={styles.profileIdentity}>
              <div className={styles.nameRow}>
                <h1 className={styles.personName}>{cleanEnName}</h1>
                {cleanBnName && (
                  <span className={styles.personBnName}>({cleanBnName})</span>
                )}
                {getStatusBadge(registration.status)}
              </div>

              <div className={styles.programSubtitle}>
                <span className={styles.programBadge}>
                  <BookOpen size={13} /> {registration.subjectName}
                </span>
                <span className={styles.branchBadge}>
                  <Building2 size={13} /> {registration.branchName} ({registration.branchType})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. BENTO STATS QUICK STRIP (4 Key Metrics)
           ========================================================================= */}
        <div className={styles.bentoStrip}>
          <div className={styles.bentoStatCard}>
            <div className={styles.bentoIconBox}>
              <UserCheck size={16} color="var(--brand-orange)" />
            </div>
            <div>
              <span className={styles.bentoLabel}>Registration No</span>
              <div className={styles.bentoValMonospace}>{registration.registrationNo}</div>
            </div>
          </div>

          <div className={styles.bentoStatCard}>
            <div className={styles.bentoIconBox}>
              <Calendar size={16} color="#3B82F6" />
            </div>
            <div>
              <span className={styles.bentoLabel}>Age & Gender</span>
              <div className={styles.bentoVal}>
                {age !== null ? `${age} Yrs` : '—'} • {val(person.gender)}
              </div>
            </div>
          </div>

          <div className={styles.bentoStatCard}>
            <div className={styles.bentoIconBox}>
              <CreditCard size={16} color="#10B981" />
            </div>
            <div>
              <span className={styles.bentoLabel}>Application Fee</span>
              <div className={styles.bentoVal} style={{color: '#10B981'}}>
                ৳ {registration.payment.amount} (PAID)
              </div>
            </div>
          </div>

          <div className={styles.bentoStatCard}>
            <div className={styles.bentoIconBox}>
              <HeartPulse size={16} color="#EC4899" />
            </div>
            <div>
              <span className={styles.bentoLabel}>Blood Group</span>
              <div className={styles.bentoVal}>{val(person.bloodGroup)}</div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. SCROLLABLE PROFILE BENTO CONTENT
           ========================================================================= */}
        <div className={styles.profileBody}>

          {/* VIVA BOARD CALLOUT (If Scheduled) */}
          {vivaInfo?.scheduledDate && (
            <div className={styles.vivaCalloutCard}>
              <div className={styles.vivaCalloutHeader}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Award size={18} color="var(--brand-orange)" />
                  <span className={styles.vivaCalloutTitle}>Viva Board Interview Scheduled</span>
                </div>
                <span className={styles.vivaLiveBadge}>● Confirmed Slot</span>
              </div>

              <div className={styles.vivaCalloutGrid}>
                <div className={styles.vivaCalloutItem}>
                  <span className={styles.vivaItemLabel}>Date & Time</span>
                  <span className={styles.vivaItemVal}>
                    📅 {vivaInfo.scheduledDate} at {vivaInfo.scheduledTime || '10:00 AM'}
                  </span>
                </div>

                <div className={styles.vivaCalloutItem}>
                  <span className={styles.vivaItemLabel}>Venue / Room</span>
                  <span className={styles.vivaItemVal}>
                    📍 {vivaInfo.room || 'Central Academy Room 102'}
                  </span>
                </div>

                {vivaInfo.examinerPanel && (
                  <div className={styles.vivaCalloutItem}>
                    <span className={styles.vivaItemLabel}>Board Examiner</span>
                    <span className={styles.vivaItemVal}>
                      👤 {vivaInfo.examinerPanel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MULTI-SUBJECT APPLICATIONS & VIVA EXAMS (When candidate applied to 1+ subjects) */}
          {registration.history && registration.history.length > 1 && (
            <div className={styles.profileCard}>
              <div className={styles.cardHeader}>
                <BookOpen size={15} color="var(--brand-orange)" />
                <h3>All Applied Subjects & Viva Exams ({registration.history.length})</h3>
              </div>

              <div className={styles.multiSubjectList}>
                {registration.history.map((h, idx) => {
                  const isCurrent = h.id === registration.id || h.registrationNo === registration.registrationNo;
                  return (
                    <div 
                      key={h.id || idx} 
                      className={`${styles.subjectRegItem} ${isCurrent ? styles.subjectRegItemCurrent : ''}`}
                    >
                      <div className={styles.subjectRegLeft}>
                        <div className={styles.subjectRegTitleRow}>
                          <span className={styles.subjectRegName}>{h.subjectName}</span>
                          {isCurrent && <span className={styles.currentSubjectBadge}>Viewing Current</span>}
                        </div>
                        <div className={styles.subjectRegMeta}>
                          <span>{h.branchName}</span>
                          <span>•</span>
                          <span style={{fontFamily: 'monospace'}}>{h.registrationNo}</span>
                          <span>•</span>
                          <span>Year {h.year}</span>
                        </div>
                      </div>

                      <div className={styles.subjectRegRight}>
                        {h.vivaDate && (
                          <span className={styles.vivaMiniBadge}>
                            📅 Viva: {h.vivaDate} {h.vivaTime ? `(${h.vivaTime})` : ''}
                          </span>
                        )}
                        {getStatusBadge(h.status as any)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 1: DIRECT CONTACT & ADDRESSES */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <Phone size={15} color="var(--brand-orange)" />
              <h3>Contact & Location</h3>
            </div>

            <div className={styles.cardGrid2}>
              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Primary Phone</span>
                <div className={styles.fieldValueWithCopy}>
                  <span className={styles.phoneHighlight}>{val(person.phone)}</span>
                  {person.phone && person.phone !== '—' && (
                    <button 
                      className={styles.copyPill}
                      onClick={() => handleCopy(person.phone, 'phone')}
                    >
                      {copiedKey === 'phone' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'phone' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Email Address</span>
                <div className={styles.fieldValueWithCopy}>
                  <span className={styles.fieldValue}>{val(person.email)}</span>
                  {person.email && person.email !== '—' && (
                    <button 
                      className={styles.copyPill}
                      onClick={() => handleCopy(person.email || '', 'email')}
                    >
                      {copiedKey === 'email' ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.fieldBoxFull}>
                <span className={styles.fieldLabel}>Present Address</span>
                <span className={styles.fieldValue}>
                  <MapPin size={13} style={{display: 'inline', marginRight: '4px', color: 'var(--text-tertiary)'}} />
                  {person.presentAddress?.addressLine ? (
                    `${person.presentAddress.addressLine}, ${person.presentAddress.thana}, ${person.presentAddress.district}`
                  ) : '—'}
                </span>
              </div>

              <div className={styles.fieldBoxFull}>
                <span className={styles.fieldLabel}>Permanent Address</span>
                <span className={styles.fieldValue}>
                  <MapPin size={13} style={{display: 'inline', marginRight: '4px', color: 'var(--text-tertiary)'}} />
                  {person.permanentAddress?.addressLine ? (
                    `${person.permanentAddress.addressLine}, ${person.permanentAddress.thana}, ${person.permanentAddress.district}`
                  ) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC & CULTURAL BACKGROUND */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <GraduationCap size={15} color="var(--brand-orange)" />
              <h3>Academic & Cultural Experience</h3>
            </div>

            <div className={styles.cardGrid2}>
              <div className={styles.fieldBoxFull}>
                <span className={styles.fieldLabel}>School / College / Institution</span>
                <span className={styles.fieldValue}>{val(person.academicInstitution)}</span>
              </div>

              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Current Class / Grade</span>
                <span className={styles.fieldValue}>{val(person.currentClass)}</span>
              </div>

              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Date of Birth</span>
                <span className={styles.fieldValue}>{val(person.dob)}</span>
              </div>

              <div className={styles.fieldBoxFull}>
                <span className={styles.fieldLabel}>Prior Cultural Training / Experience</span>
                <span className={styles.fieldValue}>
                  {val(person.previousCulturalTraining) === '—' ? 'None / First Time Applicant' : person.previousCulturalTraining}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: GUARDIAN & FAMILY */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <Users size={15} color="var(--brand-orange)" />
              <h3>Family & Emergency Contact</h3>
            </div>

            <div className={styles.cardGrid3}>
              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Father's Name</span>
                <span className={styles.fieldValue}>{val(person.fatherName)}</span>
                <span className={styles.fieldSub}>{val(person.fatherOccupation)}</span>
              </div>

              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Mother's Name</span>
                <span className={styles.fieldValue}>{val(person.motherName)}</span>
                <span className={styles.fieldSub}>{val(person.motherOccupation)}</span>
              </div>

              <div className={styles.fieldBox}>
                <span className={styles.fieldLabel}>Emergency Contact</span>
                <span className={styles.fieldValue}>{val(person.emergencyContact?.name)}</span>
                <span className={styles.fieldSub}>
                  {person.emergencyContact?.relation ? `${person.emergencyContact.relation} • ` : ''}
                  {val(person.emergencyContact?.phone)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 4: PAYMENT RECEIPT */}
          <div className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <CreditCard size={15} color="var(--brand-orange)" />
              <h3>Application Fee Receipt</h3>
            </div>

            <div className={styles.receiptBox}>
              <div className={styles.receiptHeader}>
                <div>
                  <span className={styles.receiptLabel}>Registration Fee Paid</span>
                  <div className={styles.receiptAmount}>৳ {registration.payment.amount}</div>
                </div>
                <span className={styles.paidPill}>● {registration.payment.status}</span>
              </div>

              <div className={styles.receiptGrid}>
                <div>
                  <span className={styles.fieldLabel}>Payment Channel</span>
                  <span className={styles.fieldValue}>{registration.payment.method}</span>
                </div>
                <div>
                  <span className={styles.fieldLabel}>Transaction ID</span>
                  <span className={styles.fieldValueMonospace}>{val(registration.payment.transactionId)}</span>
                </div>
                <div>
                  <span className={styles.fieldLabel}>Date & Time</span>
                  <span className={styles.fieldValue}>{val(registration.payment.paidAt)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            4. BOTTOM ACTION DOCK
           ========================================================================= */}
        <div className={styles.bottomDock}>
          <div className={styles.dockLeft}>
            <button 
              className={styles.dockBtnSecondary}
              onClick={() => alert(`Printing official registration slip for ID: ${registration.registrationNo}`)}
            >
              <Printer size={14} /> Print Admit Slip
            </button>
          </div>

          <div className={styles.dockRight}>
            {registration.status === 'PENDING_VIVA' && (
              <button 
                className={styles.dockBtnPrimary}
                onClick={() => onScheduleViva(registration)}
              >
                <Calendar size={14} /> Schedule Viva Board
              </button>
            )}

            {registration.status === 'VIVA_SCHEDULED' && (
              <>
                <button 
                  className={styles.dockBtnDanger}
                  onClick={() => onUpdateStatus(registration.id, 'REJECTED')}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button 
                  className={styles.dockBtnSuccess}
                  onClick={() => {
                    if (onEvaluateViva) {
                      onEvaluateViva(registration);
                    } else {
                      onUpdateStatus(registration.id, 'SELECTED');
                    }
                  }}
                >
                  <CheckCircle2 size={14} /> Assess & Select in Viva
                </button>
              </>
            )}

            {registration.status === 'SELECTED' && (
              <span className={styles.selectedTag}>
                <CheckCircle2 size={15} color="#10B981" /> Selected for Workshop
              </span>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
