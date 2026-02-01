import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

/**
 * Header Component
 * 
 * Top navigation bar with user menu.
 */

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h2 className="page-title">Dashboard</h2>
                </div>

                <div className="header-right">
                    <div className="notifications">
                        <button className="notification-btn">
                            🔔
                            <span className="badge">3</span>
                        </button>
                    </div>

                    <div className="user-menu">
                        <button className="user-menu-btn">
                            <span className="user-avatar">
                                {user?.full_name.charAt(0).toUpperCase()}
                            </span>
                            <span className="user-name">{user?.full_name}</span>
                        </button>

                        <div className="dropdown">
                            <button onClick={() => window.location.href = '/profile'}>
                                👤 Profile
                            </button>
                            <button onClick={() => logout()}>
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
