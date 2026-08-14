import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import styles from '../App.module.css';
import AddSubjectModal from '../components/modals/AddSubjectModal';

// Mock Data
const initialSubjects = [
  { id: 1, name: 'Recitation', code: 'REC-01', status: 'ACTIVE' },
  { id: 2, name: 'Nasheed', code: 'NSD-01', status: 'ACTIVE' },
  { id: 3, name: 'Acting', code: 'ACT-01', status: 'ACTIVE' },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleAdd = (newSubj: { name: string; code: string }) => {
    setSubjects([
      ...subjects,
      {
        id: subjects.length + 1,
        ...newSubj,
        status: 'ACTIVE'
      }
    ]);
    setIsModalOpen(false);
  };

  const filtered = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Subjects Master List</h2>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className={styles.searchBox}>
              <Search size={16} /> 
              <input 
                type="text" 
                placeholder="Search subjects..." 
                style={{border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)'}}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btnPrimary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Subject
            </button>
          </div>
        </div>
        
        <div className={styles.table}>
          <div className={styles.tableHeader} style={{gridTemplateColumns: '2fr 1fr 1fr 0.5fr'}}>
            <div>Subject Name</div>
            <div>Code</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {filtered.map(subj => (
            <div className={styles.tableRow} key={subj.id} style={{gridTemplateColumns: '2fr 1fr 1fr 0.5fr'}}>
              <div style={{fontWeight: 700}}>{subj.name}</div>
              <div style={{color: 'var(--text-secondary)'}}>{subj.code || '-'}</div>
              <div>
                <span className={`${styles.statusPill} ${subj.status === 'ACTIVE' ? styles.statusDone : styles.statusPending}`}>
                  {subj.status}
                </span>
              </div>
              <div style={{color: 'var(--text-tertiary)', cursor: 'pointer'}}>
                <MoreHorizontal size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
    </>
  );
}
