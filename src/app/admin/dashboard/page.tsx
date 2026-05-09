'use client';
import React from 'react';
import { 
    Users, 
    Calendar, 
    Clock, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle2, 
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Activity
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function DashboardPage() {
    const user = useAppSelector((s) => s.auth?.user);

    const stats = [
        { label: 'Tổng nhân viên', value: '248', change: '+12%', icon: Users, color: 'var(--accent-light)' },
        { label: 'Có mặt hôm nay', value: '231', change: '+2.5%', icon: CheckCircle2, color: 'var(--green)' },
        { label: 'Đang nghỉ phép', value: '12', change: '-4%', icon: Calendar, color: 'var(--amber)' },
        { label: 'Đi muộn/Về sớm', value: '5', change: '+1%', icon: Clock, color: 'var(--red)' },
    ];

    const activities = [
        { id: 1, type: 'new_user', text: 'Nguyễn Văn An đã gia nhập công ty', time: '10 phút trước', icon: Users, color: 'var(--accent)' },
        { id: 2, type: 'leave', text: 'Trần Thị Bình xin nghỉ phép 2 ngày', time: '2 giờ trước', icon: Calendar, color: 'var(--amber)' },
        { id: 3, type: 'payroll', text: 'Đã hoàn tất tính lương đợt 1 tháng 5', time: '5 giờ trước', icon: Briefcase, color: 'var(--green)' },
        { id: 4, type: 'alert', text: 'Phát hiện lỗi chấm công tại chi nhánh HN', time: '1 ngày trước', icon: AlertCircle, color: 'var(--red)' },
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chào mừng trở lại, {user?.email?.split('@')[0] || 'Admin'}!</h1>
                    <p className="page-subtitle">Dưới đây là tóm tắt tình hình nhân sự của bạn ngày hôm nay.</p>
                </div>
                <div className="topbar-actions">
                    <button className="btn btn-ghost btn-sm">
                        <Activity size={14} /> Xuất báo cáo
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <ArrowUpRight size={14} /> Xem chi tiết
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stat-grid">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    const isPositive = stat.change.startsWith('+');
                    return (
                        <div key={i} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: 42, height: 42, borderRadius: 10, 
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyCenter: 'center',
                                    color: stat.color, flexShrink: 0
                                }}>
                                    <Icon size={20} style={{ margin: 'auto' }} />
                                </div>
                                <span style={{ 
                                    fontSize: 11, fontWeight: 600, 
                                    color: isPositive ? 'var(--green)' : 'var(--red)',
                                    display: 'flex', alignItems: 'center', gap: 2
                                }}>
                                    {stat.change}
                                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                </span>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                {/* Recent Activity */}
                <div className="table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="table-toolbar">
                        <p className="table-title">Hoạt động gần đây</p>
                        <button className="btn btn-ghost btn-sm">Xem tất cả</button>
                    </div>
                    <div style={{ padding: '12px 20px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {activities.map((act) => {
                                const Icon = act.icon;
                                return (
                                    <div key={act.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <div style={{ 
                                            width: 32, height: 32, borderRadius: 8, 
                                            background: `${act.color}15`, 
                                            display: 'flex', alignItems: 'center', justifyCenter: 'center',
                                            color: act.color, flexShrink: 0
                                        }}>
                                            <Icon size={16} style={{ margin: 'auto' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{act.text}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{act.time}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="table-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="table-toolbar">
                        <p className="table-title">Lối tắt quản trị</p>
                    </div>
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[
                            { label: 'Tài khoản', sub: 'Quản lý user', icon: Users, href: '/admin/accounts' },
                            { label: 'Vai trò', sub: 'Phân quyền', icon: Shield, href: '/admin/roles' },
                            { label: 'Quyền hạn', sub: 'Chi tiết API', icon: Key, href: '/admin/permissions' },
                            { label: 'Hệ thống', sub: 'Cấu hình', icon: Settings, href: '/admin/settings' },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <a key={i} href={item.href} style={{ 
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: 12, padding: '16px', textDecoration: 'none',
                                    transition: 'all 0.2s', display: 'block'
                                }} onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-accent)';
                                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                                }} onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.background = 'var(--bg-elevated)';
                                }}>
                                    <Icon size={20} style={{ color: 'var(--accent-light)', marginBottom: 8 }} />
                                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend / Small Table */}
            <div className="table-card" style={{ marginTop: 24 }}>
                <div className="table-toolbar">
                    <p className="table-title">Tình trạng chấm công chi nhánh</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Chi nhánh</th>
                            <th>Tổng nhân sự</th>
                            <th>Vắng mặt</th>
                            <th>Hiệu suất</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Hồ Chí Minh', total: 120, absent: 2, perf: '98%', status: 'Ổn định', color: 'badge-green' },
                            { name: 'Hà Nội', total: 85, absent: 3, perf: '96%', status: 'Ổn định', color: 'badge-green' },
                            { name: 'Đà Nẵng', total: 43, absent: 0, perf: '100%', status: 'Tốt', color: 'badge-blue' },
                        ].map((row, i) => (
                            <tr key={i}>
                                <td className="td-primary">{row.name}</td>
                                <td>{row.total}</td>
                                <td>{row.absent}</td>
                                <td>{row.perf}</td>
                                <td><span className={`badge ${row.color}`}>{row.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// Re-using some types/icons from layout but locally defined icons for shortcuts
const Shield = ({ size, style }: any) => <Activity size={size} style={style} />; // Mock for demo
const Key = ({ size, style }: any) => <TrendingUp size={size} style={style} />; // Mock for demo
const Settings = ({ size, style }: any) => <Clock size={size} style={style} />; // Mock for demo