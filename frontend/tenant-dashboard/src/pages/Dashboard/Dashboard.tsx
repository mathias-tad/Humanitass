import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

/**
 * Dashboard Component
 * 
 * Main dashboard showing key metrics and recent activity.
 */

interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    onLeave: number;
    pendingApprovals: number;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get<DashboardStats>(
                `${import.meta.env.VITE_API_URL}/dashboard/stats`
            );
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.full_name}!</h1>
                <p className="date">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Employees"
                    value={stats?.totalEmployees || 0}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Present Today"
                    value={stats?.presentToday || 0}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Absent Today"
                    value={stats?.absentToday || 0}
                    icon="❌"
                    color="red"
                />
                <StatCard
                    title="On Leave"
                    value={stats?.onLeave || 0}
                    icon="🏖️"
                    color="orange"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats?.pendingApprovals || 0}
                    icon="⏳"
                    color="purple"
                />
            </div>

            <div className="dashboard-sections">
                <RecentActivity />
                <QuickActions />
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className={`stat-card stat-${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
                <h3 className="stat-value">{value}</h3>
                <p className="stat-title">{title}</p>
            </div>
        </div>
    );
};

const RecentActivity: React.FC = () => {
    return (
        <div className="recent-activity card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
                <div className="activity-item">
                    <span className="activity-icon">👤</span>
                    <div className="activity-content">
                        <p className="activity-text">John Doe checked in</p>
                        <span className="activity-time">5 minutes ago</span>
                    </div>
                </div>
                <div className="activity-item">
                    <span className="activity-icon">📝</span>
                    <div className="activity-content">
                        <p className="activity-text">Leave request from Jane Smith</p>
                        <span className="activity-time">1 hour ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickActions: React.FC = () => {
    return (
        <div className="quick-actions card">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
                <button className="action-btn">
                    ➕ Add Employee
                </button>
                <button className="action-btn">
                    💰 Run Payroll
                </button>
                <button className="action-btn">
                    📊 View Reports
                </button>
                <button className="action-btn">
                    ⚙️ Settings
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
