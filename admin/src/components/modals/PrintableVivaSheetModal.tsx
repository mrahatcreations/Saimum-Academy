import { Printer } from 'lucide-react';
import Modal from '../ui/Modal';
import type { Registration } from '../../types/admission';

interface PrintableVivaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  sessionTitle?: string;
}

export default function PrintableVivaSheetModal({
  isOpen,
  onClose,
  registrations,
  sessionTitle = '2026 Academic Admission Session'
}: PrintableVivaSheetModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print Viva Board Evaluation & Call Sheet"
    >
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
        <button
          type="button"
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--brand-orange)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          <Printer size={16} />
          Print / Save as PDF
        </button>
      </div>

      <div 
        id="printable-viva-sheet"
        style={{
          background: '#ffffff',
          color: '#111827',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          fontFamily: 'system-ui, sans-serif',
          maxHeight: '65vh',
          overflowY: 'auto'
        }}
      >
        {/* Official Header */}
        <div style={{textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: '12px', marginBottom: '16px'}}>
          <h2 style={{margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#111827'}}>
            সাইমুম শিল্পীগোষ্ঠী কেন্দ্রীয় একাডেমি
          </h2>
          <div style={{fontSize: '0.9rem', fontWeight: 600, color: '#4B5563', marginTop: '2px'}}>
            Saimum Central Academy — Viva Board Candidate Call & Evaluation Sheet
          </div>
          <div style={{fontSize: '0.8rem', color: '#6B7280', marginTop: '4px'}}>
            Session: <strong>{sessionTitle}</strong> • Total Candidates: <strong>{registrations.length}</strong> • Date Generated: {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Candidate Evaluation Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.78rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{background: '#F3F4F6', borderBottom: '2px solid #9CA3AF'}}>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '35px', textAlign: 'center'}}>SL</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '90px'}}>Reg No</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB'}}>Candidate Name & Phone</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB'}}>Branch & Subject</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '90px'}}>Viva Slot</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '55px', textAlign: 'center'}}>Voice /10</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '55px', textAlign: 'center'}}>Rhythm /10</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '65px', textAlign: 'center'}}>Decision</th>
              <th style={{padding: '8px 6px', border: '1px solid #D1D5DB', width: '80px', textAlign: 'center'}}>Sign</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r, index) => {
              const vivaDate = r.viva?.scheduledDate || 'Pending';
              const vivaTime = r.viva?.scheduledTime || '';
              return (
                <tr key={r.id} style={{borderBottom: '1px solid #E5E7EB'}}>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB', textAlign: 'center', fontWeight: 600}}>
                    {index + 1}
                  </td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB', fontFamily: 'monospace', fontWeight: 700}}>
                    {r.registrationNo}
                  </td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}>
                    <div style={{fontWeight: 700}}>{r.person.fullNameEn}</div>
                    <div style={{fontSize: '0.7rem', color: '#6B7280'}}>{r.person.phone}</div>
                  </td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}>
                    <div style={{fontWeight: 600}}>{r.subjectName}</div>
                    <div style={{fontSize: '0.7rem', color: '#6B7280'}}>{r.branchName}</div>
                  </td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB', fontSize: '0.72rem'}}>
                    <div>{vivaDate}</div>
                    <div style={{color: '#6B7280'}}>{vivaTime}</div>
                  </td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}></td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}></td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}></td>
                  <td style={{padding: '6px', border: '1px solid #D1D5DB'}}></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Board Signatures */}
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '16px', fontSize: '0.8rem'}}>
          <div style={{borderTop: '1px solid #4B5563', width: '180px', textAlign: 'center'}}>
            Examiner / Panel Lead
          </div>
          <div style={{borderTop: '1px solid #4B5563', width: '180px', textAlign: 'center'}}>
            Department Director
          </div>
          <div style={{borderTop: '1px solid #4B5563', width: '180px', textAlign: 'center'}}>
            Central Director (Saimum)
          </div>
        </div>
      </div>
    </Modal>
  );
}
