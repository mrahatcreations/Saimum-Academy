import { useState } from 'react';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import styles from '../App.module.css';
import AddStudentModal from '../components/modals/AddStudentModal';

// Mock Data
const initialStudents = [
  { id: 1, studentId: 'SA-26001', fullName: 'Rahim Uddin', phone: '01711000000', status: 'ACTIVE' },
  { id: 2, studentId: 'SA-26002', fullName: 'Karim Hasan', phone: '01822000000', status: 'ACTIVE' },
  { id: 3, studentId: 'SA-26003', fullName: 'Sadia Amin', phone: '01933000000', status: 'INACTIVE' },
];

export default function Students() {
  const [students, setStudents] = useState(initialStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleAdd = (newStudent: { fullName: string; phone: string; email: string }) => {
    setStudents([
      {
        id: students.length + 1,
        studentId: `SA-2600${students.length + 1}`,
        fullName: newStudent.fullName,
        phone: newStudent.phone,
        status: 'ACTIVE'
      },
      ...students
    ]);
    setIsModalOpen(false);
  };

  const filtered = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Student Directory</h2>
          <div style={{display: 'flex', gap: '16px'}}>
            <div className={styles.searchBox}>
              <Search size={16} /> 
              <input 
                type="text" 
                placeholder="Search students..." 
                style={{border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)'}}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btnPrimary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Register Student
            </button>
          </div>
        </div>
        
        <div className={styles.table}>
          <div className={styles.tableHeader} style={{gridTemplateColumns: '1fr 2fr 1.5fr 1fr 0.5fr'}}>
            <div>Student ID</div>
            <div>Full Name</div>
            <div>Phone</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          {filtered.map(student => (
            <div className={styles.tableRow} key={student.id} style={{gridTemplateColumns: '1fr 1fr 1.5fr 1fr 0.5fr'}}>
              <div style={{color: 'var(--text-secondary)', fontWeight: 600}}>{student.studentId}</div>
              <div className={styles.userCell}>
                <div className={styles.userAvatar} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-orange-alpha)', color: 'var(--brand-orange)', fontSize: '12px'}}>
                  {student.fullName.charAt(0)}
                </div>
                <span style={{fontWeight: 700}}>{student.fullName}</span>
              </div>
              <div style={{color: 'var(--text-secondary)'}}>{student.phone}</div>
              <div>
                <span className={`${styles.statusPill} ${student.status === 'ACTIVE' ? styles.statusDone : styles.statusPending}`}>
                  {student.status}
                </span>
              </div>
              <div style={{color: 'var(--text-tertiary)', cursor: 'pointer'}}>
                <MoreHorizontal size={20} />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)'}}>
              No students found.
            </div>
          )}
        </div>
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAdd} />
    </>
  );
}
