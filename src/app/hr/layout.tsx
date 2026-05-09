'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Building2,
    CalendarCheck2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileText,
    Key,
    LogOut,
    Search,
    Settings,
    Bell,
    LayoutDashboard,
    Users,
    BriefcaseBusiness,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { clearStoredUser, clearTokens } from '@/utils/tokenStorage';
import { getRoleCodes, hasRole } from '@/utils/roleUtils';
import HrmGlobalStyles from '@/components/HrmGlobalStyles';

type NavItem =
    | { label: string; isSection: true }
    | { label: string; href: string; icon: LucideIcon; badge?: string | null };
const isNavSection = (item: NavItem): item is Extract<NavItem, { isSection: true }> =>
    'isSection' in item && item.isSection === true;

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Nhân viên', href: '/hr/employees', icon: Users },
    { label: 'Chấm công', href: '/hr/attendances', icon: Clock3 },
    { label: 'Ca làm', href: '/hr/work-shifts', icon: CalendarCheck2 },
    { label: 'Nghỉ phép', href: '/hr/leave-requests', icon: Key },
    { label: 'Tuyển dụng', href: '/hr/recruitment', icon: BriefcaseBusiness },
    { label: 'Hợp đồng', href: '/hr/contracts', icon: FileText },
] as const;

export default function HrLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth?.user);
    const [collapsed, setCollapsed] = useState(false);

    const roleCodes = useMemo(() => getRoleCodes(user?.roles), [user?.roles]);
    const hasHrRole = useMemo(() => hasRole(roleCodes, 'HR'), [roleCodes]);
    const forbidden = Boolean(user) && !hasHrRole;

    useEffect(() => {
        if (forbidden) router.replace('/403');
    }, [forbidden, router]);

    if (forbidden) return null;

    const handleLogout = () => {
        dispatch(logout());
        clearTokens();
        clearStoredUser();
    };

    return (
        <div className="hrm-shell">
            <HrmGlobalStyles />

            <aside className={`hrm-sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <Building2 size={22} className="brand-icon" />
                    {!collapsed && <span className="brand-text">GiaKhanh</span>}
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map((item, idx) => {
                        if (isNavSection(item)) {
                            return !collapsed ? (
                                <p key={idx} className="nav-section-label">{item.label}</p>
                            ) : (
                                <hr key={idx} className="nav-divider" />
                            );
                        }
                        const Icon = item.icon;
                        const href = item.href;
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
                                <Icon size={18} className="nav-icon" />
                                {!collapsed && <span className="nav-label">{item.label}</span>}
                                {active && <span className="nav-active-bar" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="user-pill">
                            <div className="user-avatar">
                                {user?.email?.[0]?.toUpperCase() ?? 'H'}
                            </div>
                            <div className="user-info">
                                <p className="user-email">{user?.email ?? 'hr'}</p>
                                <p className="user-role">{hasHrRole ? 'HR' : roleCodes[0] ?? 'User'}</p>
                            </div>
                        </div>
                    )}
                    <button className="nav-item logout-btn" onClick={handleLogout} title="Đăng xuất">
                        <LogOut size={18} className="nav-icon" />
                        {!collapsed && <span className="nav-label">Đăng xuất</span>}
                    </button>
                </div>

                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            <div className="hrm-content">
                <header className="hrm-topbar">
                    <div className="topbar-search">
                        <Search size={16} className="search-icon" />
                        <input type="text" placeholder="Tìm kiếm…" className="search-input" />
                    </div>
                    <div className="topbar-actions">
                        <button className="topbar-btn" id="notification-btn">
                            <Bell size={18} />
                        </button>
                        <button className="topbar-btn" id="settings-btn">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                <main className="hrm-main">{children}</main>
            </div>
        </div>
    );
}

