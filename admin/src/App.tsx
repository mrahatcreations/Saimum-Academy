import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Branches from './pages/Branches';
import Departments from './pages/Departments';
import Subjects from './pages/Subjects';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="branches" element={<Branches />} />
          <Route path="departments" element={<Departments />} />
          <Route path="subjects" element={<Subjects />} />
          {/* Catch-all for undefined routes inside layout */}
          <Route path="*" element={
            <div style={{padding: '48px', color: 'var(--text-secondary)'}}>Page not found or under construction</div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
