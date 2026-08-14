import { useState } from 'react';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import styles from '../App.module.css';
import AddDepartmentModal from '../components/modals/AddDepartmentModal';

// Mock Data
const initialDepartments = [
  { id: 1, name: 'Saimum Shishukalyan', branchCount: 4, status: 'ACTIVE' },
  { id: 2, name: 'Saimum Tarunno', branchCount: 2, status: 'ACTIVE' },
  { id: 3, name: 'Saimum Islamic Studies', branchCount: 3, status: 'ACTIVE' },
];

export default function Departments() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleAddDepartment = (name: string) => {
    setDepartments([
      ...departments,
      {
        id: departments.length + 1,
        name,
        branchCount: 0,
        status: 'ACTIVE'
      }
    ]);
    setIsModalOpen(false);
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Departments</h2>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className={styles.searchBox}>
              <Search size={16} /> 
              <input 
                type="text" 
                placeholder="Search departments..." 
                style={{border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)'}}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btnPrimary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Department
            </button>
          </div>
        </div>
        
        <div className={styles.table}>
          <div className={styles.tableHeader} style={{gridTemplateColumns: '2fr 1fr 1fr 0.5fr'}}>
            <div>Department Name</div>
            <div>Assigned Branches</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {filtered.map(dept => (
            <div className={styles.tableRow} key={dept.id} style={{gridTemplateColumns: '2fr 1fr 1fr 0.5fr'}}>
              <div style={{fontWeight: 700}}>{dept.name}</div>
              <div style={{color: 'var(--text-secondary)', fontWeight: 600}}>
                <span style={{background: '#F3F4F6', padding: '4px 12px', borderRadius: '12px'}}>{dept.branchCount} Branches</span>
              </div>
              <div>
                <span className={`${styles.statusPill} ${dept.status === 'ACTIVE' ? styles.statusDone : styles.statusPending}`}>
                  {dept.status}
                </span>
              </div>
              <div style={{color: 'var(--text-tertiary)', cursor: 'pointer'}}>
                <MoreHorizontal size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddDepartmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddDepartment} 
      />
    </>
  );
}
