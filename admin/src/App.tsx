import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './components/ui/forms.css';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Code-split pages for optimal performance and chunk loading
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Branches = lazy(() => import('./pages/Branches'));
const Departments = lazy(() => import('./pages/Departments'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Admissions = lazy(() => import('./pages/Admissions'));
const Batches = lazy(() => import('./pages/Batches'));
const RegistrationFormBuilder = lazy(() => import('./pages/RegistrationFormBuilder'));
const Settings = lazy(() => import('./pages/Settings'));
const Staff = lazy(() => import('./pages/Staff'));
const Workshops = lazy(() => import('./pages/Workshops'));
const OrgHierarchy = lazy(() => import('./pages/OrgHierarchy'));
const Payments = lazy(() => import('./pages/Payments'));
const FinancialReport = lazy(() => import('./pages/FinancialReport'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '300px',
      color: 'var(--text-secondary)',
      fontSize: '0.86rem',
      fontWeight: 600
    }}>
      Loading...
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="batches" element={<Batches />} />
              <Route path="students" element={<Students />} />
              <Route path="branches" element={<Branches />} />
              <Route path="departments" element={<Departments />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="payments" element={<Payments />} />
              <Route path="financial-management" element={<FinancialReport />} />
              <Route path="financial-report" element={<FinancialReport />} />
              <Route path="staff" element={<Staff />} />
              <Route path="hierarchy" element={<OrgHierarchy />} />
              <Route path="organization-tree" element={<OrgHierarchy />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="admissions/form-builder" element={<RegistrationFormBuilder />} />
              <Route path="form-builder" element={<RegistrationFormBuilder />} />
              <Route path="settings" element={<Settings />} />
              {/* Catch-all for undefined routes inside layout */}
              <Route path="*" element={
                <div style={{padding: '48px', color: 'var(--text-secondary)'}}>Page not found or under construction</div>
              } />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
