import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

/**
 * Main Layout Component
 * 
 * Wraps all authenticated pages with sidebar and header.
 */

const MainLayout: React.FC = () => {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
