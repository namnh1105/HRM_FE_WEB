'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Users,
    Shield,
    Key,
    LayoutDashboard,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Building2,
    Bell,
    Search,
    Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { clearTokens, clearStoredUser } from '@/utils/tokenStorage';
import { getRoleCodes, hasRole } from '@/utils/roleUtils';
import AppGlobalStyles from '@/components/AppGlobalStyles';

type NavItem =
    | { label: string; isSection: true }
    | { label: string; href: string; icon: LucideIcon; badge?: string | null };
const isNavSection = (item: NavItem): item is Extract<NavItem, { isSection: true }> =>
    'isSection' in item && item.isSection === true;

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Tài khoản',
        href: '/admin/accounts',
        icon: Users,
    },
    {
        label: 'Vai trò',
        href: '/admin/roles',
        icon: Shield,
    },
    {
        label: 'Quyền hạn',
        href: '/admin/permissions',
        icon: Key,
    },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth?.user);
    const [collapsed, setCollapsed] = useState(false);
    const roleCodes = useMemo(() => getRoleCodes(user?.roles), [user?.roles]);
    const hasAdminRole = useMemo(() => hasRole(roleCodes, 'ADMIN'), [roleCodes]);
    const forbidden = Boolean(user) && !hasAdminRole;

    useEffect(() => {
        if (forbidden) {
            router.replace('/403');
        }
    }, [forbidden, router]);

    if (forbidden) return null;

    const handleLogout = () => {
        dispatch(logout());
        clearTokens();
        clearStoredUser();
    };

    return (
        <div className="hrm-shell">
            <AppGlobalStyles />
            {/* ── Sidebar ── */}
            <aside className={`hrm-sidebar ${collapsed ? 'collapsed' : ''}`}>
                {/* Logo */}
                <div className="sidebar-brand">
                    <Building2 size={22} className="brand-icon" />
                    {!collapsed && <span className="brand-text">GiaKhanh</span>}
                </div>

                {/* Nav */}
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

                {/* User pill */}
                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="user-pill">
                            <div className="user-avatar">
                                {user?.email?.[0]?.toUpperCase() ?? 'A'}
                            </div>
                            <div className="user-info">
                                <p className="user-email">{user?.email ?? 'admin'}</p>
                                <p className="user-role">{hasAdminRole ? 'ADMIN' : roleCodes[0] ?? 'User'}</p>
                            </div>
                        </div>
                    )}
                    <button className="nav-item logout-btn" onClick={handleLogout} title="Đăng xuất">
                        <LogOut size={18} className="nav-icon" />
                        {!collapsed && <span className="nav-label">Đăng xuất</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </aside>

            {/* ── Main content ── */}
            <div className="hrm-content">
                {/* Top bar */}
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

                <main className="hrm-main">
                    {children}
                </main>
            </div>
        </div>
    );
}
