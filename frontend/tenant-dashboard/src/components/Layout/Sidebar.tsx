import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar Navigation Component
 */

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/attendance', label: 'Attendance', icon: '📅' },
        { path: '/payroll', label: 'Payroll', icon: '💰' },
        { path: '/leaves', label: 'Leaves', icon: '🏖️' },
        { path: '/performance', label: 'Performance', icon: '🎯' },
        { path: '/reports', label: 'Reports', icon: '📈' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    // Filter menu based on role
    const filteredNavItems = user?.role === 'admin'
        ? navItems
        : navItems.filter(item => !['payroll', 'settings'].includes(item.path.substring(1)));

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="logo">Humanitas</h2>
                <p className="company-name">{user?.tenantSlug}</p>
            </div>

            <nav className="sidebar-nav">
                {filteredNavItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                        <p className="user-name">{user?.full_name}</p>
                        <p className="user-role">{user?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
