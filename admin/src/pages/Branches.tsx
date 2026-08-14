import { useState } from 'react';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import styles from '../App.module.css';
import AddBranchModal from '../components/modals/AddBranchModal';

// Mock Data
const initialBranches = [
  { id: 1, name: 'Dhaka Central', code: 'DHK-01', type: 'PHYSICAL', status: 'ACTIVE' },
  { id: 2, name: 'Mirpur Branch', code: 'MIR-02', type: 'PHYSICAL', status: 'ACTIVE' },
  { id: 3, name: 'Online Academy', code: 'ONL-00', type: 'ONLINE', status: 'ACTIVE' },
];

export default function Branches() {
  const [branches, setBranches] = useState(initialBranches);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddBranch = (newBranch: { name: string; code: string; type: string }) => {
    setBranches([
      ...branches,
      {
        id: branches.length + 1,
        ...newBranch,
        status: 'ACTIVE'
      }
    ]);
    setIsModalOpen(false);
  };

  const filteredBranches = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Branch Management</h2>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className={styles.searchBox}>
              <Search size={16} /> 
              <input 
                type="text" 
                placeholder="Search branches..." 
                style={{border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)'}}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btnPrimary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Branch
            </button>
          </div>
        </div>
        
        <div className={styles.table}>
          <div className={styles.tableHeader} style={{gridTemplateColumns: '1fr 1fr 1fr 1fr 0.5fr'}}>
            <div>Branch Name</div>
            <div>Code</div>
            <div>Type</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {filteredBranches.map(branch => (
            <div className={styles.tableRow} key={branch.id} style={{gridTemplateColumns: '1fr 1fr 1fr 1fr 0.5fr'}}>
              <div style={{fontWeight: 700}}>{branch.name}</div>
              <div style={{color: 'var(--text-secondary)'}}>{branch.code}</div>
              <div>
                <span style={{
                  padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                  background: branch.type === 'ONLINE' ? '#E0E7FF' : '#F3F4F6',
                  color: branch.type === 'ONLINE' ? '#4F46E5' : 'var(--text-secondary)'
                }}>
                  {branch.type}
                </span>
              </div>
              <div>
                <span className={`${styles.statusPill} ${branch.status === 'ACTIVE' ? styles.statusDone : styles.statusPending}`}>
                  {branch.status}
                </span>
              </div>
              <div style={{color: 'var(--text-tertiary)', cursor: 'pointer'}}>
                <MoreHorizontal size={20} />
              </div>
            </div>
          ))}

          {filteredBranches.length === 0 && (
            <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
              No branches found.
            </div>
          )}
        </div>
      </div>

      <AddBranchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddBranch} 
      />
    </>
  );
}
