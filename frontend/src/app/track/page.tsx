'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Printer, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { publicApi } from '@/services/api';
import type { Registration } from '@/types/admission';
import styles from './track.module.css';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Registration[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchStr: string) => {
    if (!searchStr.trim()) return;
    setIsSearching(true);
    setSearched(true);
    try {
      const res = await publicApi.trackApplication(searchStr.trim());
      if (res.success) {
        setResults(res.data || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!initialQuery) return;
    let isMounted = true;
    const fetchInitial = async () => {
      setIsSearching(true);
      setSearched(true);
      try {
        const res = await publicApi.trackApplication(initialQuery.trim());
        if (isMounted) {
          setResults(res.success ? (res.data || []) : []);
        }
      } catch (err) {
        console.error('Search failed:', err);
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, [initialQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VIVA':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--bg-section-alt)', color: 'var(--text-heading)', border: '1px solid var(--border-rule)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--status-warning)' }} />
            Application Submitted
          </span>
        );
      case 'VIVA_SCHEDULED':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--status-info-bg)', color: 'var(--status-info)', border: '1px solid var(--status-info)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--status-info)' }} />
            Viva / Audition Scheduled
          </span>
        );
      case 'SELECTED':
      case 'WORKSHOP':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--status-success)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            ✓ Qualified / Selected
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--bg-section-alt)', color: 'var(--text-muted)', border: '1px solid var(--border-rule)' }}>
            Not Qualified
          </span>
        );
      default:
        return <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--bg-section-alt)', color: 'var(--text-muted)', border: '1px solid var(--border-rule)' }}>{status}</span>;
    }
  };

  return (
    <div className={styles.trackWrapper}>
      
      {/* Header */}
      <div className={styles.headerBox}>
        <span className={styles.preTitle}>Application Tracking Portal</span>
        <h1 className={styles.title}>ভর্তি আবেদন ও ভাইভা স্ট্যাটাস</h1>
        <p className={styles.desc}>
          আপনার রেজিস্ট্রেশন নম্বর (যেমন: SA-2026-1001) অথবা আবেদনের সময় ব্যবহৃত মোবাইল নম্বর প্রদান করে বর্তমান অবস্থা যাচাই করুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className={styles.searchCard}
      >
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Enter Registration No (e.g. SA-2026-1001) or Mobile..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className={styles.searchBtn}
          disabled={isSearching}
        >
          <Search size={16} /> {isSearching ? 'Searching...' : 'Track Status'}
        </button>
      </form>

      {/* Results Container */}
      {searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {results.length === 0 ? (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-rule)',
              color: 'var(--text-muted)'
            }}>
              <AlertCircle size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <div>No applicant records found matching &quot;{query}&quot;. Please check your registration code.</div>
            </div>
          ) : (
            results.map((reg) => (
              <div key={reg.id} className={styles.resultCard}>
                <div className={styles.resultTop}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Registration Code
                    </span>
                    <div className={styles.regCode}>{reg.registrationNo}</div>
                  </div>
                  <div>
                    {getStatusBadge(reg.status)}
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Applicant Full Name</span>
                    <span className={styles.infoValue}>{reg.person.fullNameEn} {reg.person.fullNameBn ? `(${reg.person.fullNameBn})` : ''}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Mobile Number</span>
                    <span className={styles.infoValue}>{reg.person.phone}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Department & Course</span>
                    <span className={styles.infoValue}>{reg.subjectName || 'Vocal Music'} ({reg.departmentName || 'Music'})</span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Campus / Branch</span>
                    <span className={styles.infoValue}>{reg.branchName || 'Dhaka Central Campus'}</span>
                  </div>
                </div>

                {/* Viva Schedule Details (If Scheduled) */}
                {reg.status === 'VIVA_SCHEDULED' && (
                  <div className={styles.vivaAlert}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-orange)', fontSize: '0.90rem' }}>
                      <Calendar size={16} /> Viva / Audition Appointment Scheduled
                    </div>

                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.84rem', color: 'var(--text-heading)', flexWrap: 'wrap', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} color="var(--brand-orange)" />
                        <span>Date & Time: <strong>{reg.vivaDate || 'Jan 15, 2026'} at {reg.vivaTime || '10:00 AM'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--brand-orange)" />
                        <span>Room / Link: <strong>{reg.vivaRoom || 'Central Hall, Room 204'}</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Applied: {reg.appliedDate || 'Dec 08, 2025'}
                  </span>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={styles.searchBtn}
                    style={{ height: '38px', padding: '0 16px', fontSize: '0.80rem' }}
                  >
                    <Printer size={14} /> Print Admit Pass
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading application tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}

