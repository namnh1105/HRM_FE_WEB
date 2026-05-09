'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight, Users, Activity } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export default function HrDashboardPage() {
    const user = useAppSelector((s) => s.auth?.user);

    const stats = [
        { label: 'Nhân viên đang làm', value: '231', change: '+2.5%', icon: Users, color: 'var(--accent-light)' },
        { label: 'Chấm công hôm nay', value: '229', change: '+1.2%', icon: CheckCircle2, color: 'var(--green)' },
        { label: 'Đơn nghỉ phép', value: '12', change: '+3%', icon: Calendar, color: 'var(--amber)' },
        { label: 'Đi muộn/Về sớm', value: '5', change: '+1%', icon: Clock, color: 'var(--red)' },
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard HR</h1>
                    <p className="page-subtitle">
                        Xin chào, {user?.email?.split('@')[0] || 'HR'} — tổng quan công việc hôm nay.
                    </p>
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
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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

            <div className="table-card">
                <div className="table-toolbar">
                    <p className="table-title">Gợi ý nhanh</p>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {[
                        { label: 'Nhân viên', sub: 'Danh sách & hồ sơ', href: '/hr/employees' },
                        { label: 'Chấm công', sub: 'Theo dõi hôm nay', href: '/hr/attendances' },
                        { label: 'Nghỉ phép', sub: 'Duyệt yêu cầu', href: '/hr/leave-requests' },
                        { label: 'Ca làm', sub: 'Quản lý lịch', href: '/hr/work-shifts' },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 12,
                                padding: '16px',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                display: 'block',
                                color: 'inherit',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-accent)';
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = 'var(--bg-elevated)';
                            }}
                        >
                            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{item.sub}</p>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}

