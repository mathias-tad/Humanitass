import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import EmployeeList from './components/EmployeeList';
import AttendanceView from './pages/Attendance/AttendanceView';
import PayrollView from './pages/Payroll/PayrollView';
import MainLayout from './components/Layout/MainLayout';
import './styles/index.css';

/**
 * App Component
 * 
 * Root application with routing and authentication.
 */

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected routes */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="employees" element={<EmployeeList />} />
                        <Route path="attendance" element={<AttendanceView />} />
                        <Route path="payroll" element={<PayrollView />} />
                        <Route path="" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
