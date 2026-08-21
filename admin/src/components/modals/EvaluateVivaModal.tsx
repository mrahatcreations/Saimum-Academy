import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { CheckCircle2, XCircle } from 'lucide-react';
import { apiRequest } from '../../services/apiClient';
import type { Registration } from '../../types/admission';

interface EvaluateVivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onSuccess: () => void;
}

export default function EvaluateVivaModal({
  isOpen,
  onClose,
  registration,
  onSuccess
}: EvaluateVivaModalProps) {
  // Assessment Rubric (1-10 each)
  const [voiceScore, setVoiceScore] = useState<number>(8);
  const [pronunciationScore, setPronunciationScore] = useState<number>(8);
  const [presenceScore, setPresenceScore] = useState<number>(7);
  const [confidenceScore, setConfidenceScore] = useState<number>(8);

  const [examinerName, setExaminerName] = useState('Ustadh Mahbubur Rahman');
  const [examinerNotes, setExaminerNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && registration) {
      setVoiceScore(8);
      setPronunciationScore(8);
      setPresenceScore(7);
      setConfidenceScore(8);
      setExaminerName(registration.viva?.examinerPanel || 'Ustadh Mahbubur Rahman');
      setExaminerNotes('');
      setError(null);
    }
  }, [isOpen, registration]);

  if (!isOpen || !registration) return null;

  // Calculate overall average score out of 10 and out of 100
  const totalScore = voiceScore + pronunciationScore + presenceScore + confidenceScore;
  const averageScoreOutOf10 = (totalScore / 4).toFixed(1);
  const percentageScore = ((totalScore / 40) * 100).toFixed(0);

  const handleDecision = async (status: 'SELECTED' | 'REJECTED') => {
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        status,
        vivaExaminer: examinerName,
        vivaScore: parseFloat(averageScoreOutOf10),
        vivaNotes: JSON.stringify({
          voiceScore,
          pronunciationScore,
          presenceScore,
          confidenceScore,
          totalScore,
          percentageScore: parseInt(percentageScore, 10),
          notes: examinerNotes,
          evaluatedAt: new Date().toISOString()
        })
      };

      await apiRequest(`/admissions/${registration.id}/status`, {
        method: 'PATCH',
        data: payload
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit viva evaluation:', err);
      setError(err.message || 'Failed to submit viva assessment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Central Viva Assessment: ${registration.person.fullNameEn}`}
      maxWidth="680px"
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        
        {/* Candidate Context Strip */}
        <div style={{
          background: 'var(--bg-body, #f8fafc)',
          border: '1px solid var(--border-light, #e2e8f0)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)'}}>
              {registration.person.fullNameEn}
            </div>
            <div style={{fontSize: '0.78rem', color: 'var(--text-secondary)'}}>
              ID: <strong style={{fontFamily: 'monospace'}}>{registration.registrationNo}</strong> • Branch: <strong>{registration.branchName}</strong>
            </div>
          </div>

          <div style={{
            background: 'var(--brand-orange-subtle, rgba(255,121,14,0.1))',
            border: '1px solid var(--brand-orange-border, rgba(255,121,14,0.3))',
            color: 'var(--brand-orange, #ff790e)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.76rem',
            fontWeight: 700
          }}>
            🎯 Stage 1: Central Viva
          </div>
        </div>

        {/* Viva Rubric Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {/* Rubric 1 */}
          <div style={{
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)'}}>
                🎤 Voice & Tone (কণ্ঠস্বর)
              </span>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-orange)'}}>
                {voiceScore} / 10
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={voiceScore}
              onChange={e => setVoiceScore(parseInt(e.target.value, 10))}
              style={{accentColor: 'var(--brand-orange)', cursor: 'pointer'}}
            />
          </div>

          {/* Rubric 2 */}
          <div style={{
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)'}}>
                🗣️ Pronunciation (উচ্চারণ)
              </span>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#3B82F6'}}>
                {pronunciationScore} / 10
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={pronunciationScore}
              onChange={e => setPronunciationScore(parseInt(e.target.value, 10))}
              style={{accentColor: '#3B82F6', cursor: 'pointer'}}
            />
          </div>

          {/* Rubric 3 */}
          <div style={{
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)'}}>
                🎭 Expression & Interest (প্রকাশভঙ্গি)
              </span>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#8B5CF6'}}>
                {presenceScore} / 10
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={presenceScore}
              onChange={e => setPresenceScore(parseInt(e.target.value, 10))}
              style={{accentColor: '#8B5CF6', cursor: 'pointer'}}
            />
          </div>

          {/* Rubric 4 */}
          <div style={{
            background: 'var(--bg-surface, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)'}}>
                🧠 Confidence (আত্মবিশ্বাস)
              </span>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: '#10B981'}}>
                {confidenceScore} / 10
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={confidenceScore}
              onChange={e => setConfidenceScore(parseInt(e.target.value, 10))}
              style={{accentColor: '#10B981', cursor: 'pointer'}}
            />
          </div>
        </div>

        {/* Overall Score Banner */}
        <div style={{
          background: 'var(--bg-body, #f8fafc)',
          border: '1px solid var(--border-light, #e2e8f0)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase'}}>
              Calculated Viva Score
            </span>
            <div style={{fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-orange)'}}>
              {averageScoreOutOf10} <span style={{fontSize: '0.85rem', color: 'var(--text-tertiary)'}}>/ 10 ({percentageScore}%)</span>
            </div>
          </div>

          <div style={{textAlign: 'right'}}>
            <span style={{fontSize: '0.74rem', color: 'var(--text-secondary)'}}>
              Benchmark:
            </span>
            <div style={{fontSize: '0.85rem', fontWeight: 700, color: '#059669'}}>
              Pass ≥ 6.0 (Select for Workshop)
            </div>
          </div>
        </div>

        {/* Examiner Lead & Comments */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
          <div>
            <label style={{fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px'}}>
              Examiner / Panel Lead
            </label>
            <input 
              type="text"
              className="input"
              value={examinerName}
              onChange={e => setExaminerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px'}}>
              Board Remarks & Feedback
            </label>
            <input 
              type="text"
              className="input"
              placeholder="Candidate is active and eager to learn..."
              value={examinerNotes}
              onChange={e => setExaminerNotes(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div style={{color: '#DC2626', fontSize: '0.82rem', fontWeight: 600}}>
            ⚠️ {error}
          </div>
        )}

        {/* Action Decision Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <button 
            type="button" 
            className="btnCancel" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Cancel
          </button>

          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              type="button" 
              onClick={() => handleDecision('REJECTED')}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.06)',
                color: '#DC2626',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <XCircle size={15} /> Reject
            </button>

            <button 
              type="button" 
              onClick={() => handleDecision('SELECTED')}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
              }}
            >
              <CheckCircle2 size={15} /> Pass & Select for Workshop
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
}
