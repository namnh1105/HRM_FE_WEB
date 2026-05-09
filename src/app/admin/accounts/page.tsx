'use client';
import React, { useState, useMemo } from 'react';
import {
    Users,
    Plus,
    Search,
    Trash2,
    RotateCcw,
    ShieldCheck,
    ShieldOff,
    Lock,
    Unlock,
    X,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    UserX,
} from 'lucide-react';
import {
    useGetAllUsersQuery,
    useDeleteUserMutation,
    useRestoreUserMutation,
    usePermanentDeleteUserMutation,
    useGetUserRolesQuery,
    useAssignRoleToUserMutation,
    useRemoveRoleFromUserMutation,
    useActivateUserMutation,
    useDeactivateUserMutation,
} from '@/store/api/userApi';
import { useRegisterMutation } from '@/store/api/authApi';
import { useGetActiveRolesQuery } from '@/store/api/roleApi';
import type { UserResponse } from '@/types';

function useToast() {
    const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);
    const push = (msg: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    return { toasts, push };
}

function RoleManagerModal({
    user,
    onClose,
    pushToast,
}: {
    user: UserResponse;
    onClose: () => void;
    pushToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const { data: userRolesData, isLoading } = useGetUserRolesQuery(user.id);
    const { data: allRolesData } = useGetActiveRolesQuery();
    const [assign] = useAssignRoleToUserMutation();
    const [remove] = useRemoveRoleFromUserMutation();

    const userRoleIds = useMemo(
        () => new Set((userRolesData?.data ?? []).map((ur) => ur.role.id)),
        [userRolesData]
    );

    const handleToggle = async (roleId: string, has: boolean) => {
        try {
            if (has) {
                await remove({ userId: user.id, roleId }).unwrap();
                pushToast('Đã gỡ role');
            } else {
                await assign({ userId: user.id, roleId }).unwrap();
                pushToast('Đã gán role');
            }
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">Gán quyền — {user.email}</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body" style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
                            ))}
                        </div>
                    ) : (allRolesData?.data ?? []).length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Không có role nào.</p>
                    ) : (
                        (allRolesData?.data ?? []).map((role) => {
                            const has = userRoleIds.has(role.id);
                            return (
                                <div
                                    key={role.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        background: has ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                                        border: `1px solid ${has ? 'var(--border-accent)' : 'var(--border)'}`,
                                        marginBottom: 6,
                                    }}
                                >
                                    <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{role.displayName}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role.code}</p>
                                    </div>
                                    <button
                                        className={`btn btn-sm ${has ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={() => handleToggle(role.id, has)}
                                        id={`toggle-role-${role.id}`}
                                    >
                                        {has ? (<><ShieldOff size={13} /> Gỡ</>) : (<><ShieldCheck size={13} /> Gán</>)}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

function UserRolesCell({ userId }: { userId: string }) {
    const { data: userRolesData, isLoading } = useGetUserRolesQuery(userId);
    const roleNames = (userRolesData?.data ?? [])
        .map((assignment) => assignment.role?.code || assignment.role?.displayName)
        .filter((value): value is string => Boolean(value));

    if (isLoading) {
        return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Đang tải...</span>;
    }

    if (roleNames.length === 0) {
        return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Chưa có</span>;
    }

    return (
        <>
            {roleNames.map((role) => (
                <span key={role} className="badge badge-blue">{role}</span>
            ))}
        </>
    );
}

function ConfirmModal({
    title,
    desc,
    onConfirm,
    onClose,
    danger = false,
}: {
    title: string;
    desc: string;
    onConfirm: () => void;
    onClose: () => void;
    danger?: boolean;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{title}</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        id="confirm-action-btn"
                        onClick={() => { onConfirm(); onClose(); }}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateUserModal({
    onClose,
    pushToast,
}: {
    onClose: () => void;
    pushToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const [registerUser, { isLoading }] = useRegisterMutation();
    const [form, setForm] = useState({
        email: '',
        givenName: '',
        familyName: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerUser({
                email: form.email,
                givenName: form.givenName,
                familyName: form.familyName,
                password: form.password,
            }).unwrap();
            pushToast('Đã tạo người dùng');
            onClose();
        } catch {
            pushToast('Tạo thất bại', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">Thêm người dùng</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="field-group">
                            <label className="field-label">Email *</label>
                            <input
                                id="create-user-email"
                                className="field-input"
                                type="email"
                                required
                                placeholder="user@company.com"
                                value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="field-group">
                                <label className="field-label">Họ</label>
                                <input
                                    id="create-user-family"
                                    className="field-input"
                                    placeholder="Nguyễn"
                                    value={form.familyName}
                                    onChange={(e) => setForm((p) => ({ ...p, familyName: e.target.value }))}
                                />
                            </div>
                            <div className="field-group">
                                <label className="field-label">Tên</label>
                                <input
                                    id="create-user-given"
                                    className="field-input"
                                    placeholder="Văn A"
                                    value={form.givenName}
                                    onChange={(e) => setForm((p) => ({ ...p, givenName: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="field-group">
                            <label className="field-label">Mật khẩu *</label>
                            <input
                                id="create-user-password"
                                className="field-input"
                                type="password"
                                required
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary" id="create-user-submit" disabled={isLoading}>
                            {isLoading ? 'Đang tạo…' : 'Tạo người dùng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountsPage() {
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');

    const [deleteUser] = useDeleteUserMutation();
    const [restoreUser] = useRestoreUserMutation();
    const [permanentDelete] = usePermanentDeleteUserMutation();
    const [activateUser] = useActivateUserMutation();
    const [deactivateUser] = useDeactivateUserMutation();

    const { data, isLoading, isFetching } = useGetAllUsersQuery({
        page,
        size: PAGE_SIZE,
        includeDeleted: filterStatus === 'all' || filterStatus === 'deleted',
    });

    const [roleManagerUser, setRoleManagerUser] = useState<UserResponse | null>(null);
    const [confirmAction, setConfirmAction] = useState<null | {
        title: string;
        desc: string;
        action: () => void;
        danger?: boolean;
    }>(null);
    const [createUserOpen, setCreateUserOpen] = useState(false);

    const { toasts, push: pushToast } = useToast();

    const users = data?.data ?? [];
    const meta = data?.pagination;

    const totalActive = users.filter((u) => u.isActive && !u.isDeleted).length;
    const totalInactive = users.filter((u) => !u.isActive && !u.isDeleted).length;
    const totalDeleted = users.filter((u) => u.isDeleted).length;

    const filtered = useMemo(() => {
        let list = users;
        if (filterStatus === 'active') list = list.filter((u) => u.isActive && !u.isDeleted);
        else if (filterStatus === 'inactive') list = list.filter((u) => !u.isActive && !u.isDeleted);
        else if (filterStatus === 'deleted') list = list.filter((u) => u.isDeleted);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (u) =>
                    u.email.toLowerCase().includes(q) ||
                    u.employee?.fullName?.toLowerCase().includes(q) ||
                    u.roles?.some((r) => r.toLowerCase().includes(q))
            );
        }
        return list;
    }, [users, search, filterStatus]);

    const handleDelete = (user: UserResponse) => {
        setConfirmAction({
            title: 'Xóa tài khoản',
            desc: `Bạn có chắc muốn xóa tài khoản "${user.email}"? Thao tác này có thể khôi phục.`,
            danger: true,
            action: async () => {
                try {
                    await deleteUser(user.id).unwrap();
                    pushToast('Đã xóa tài khoản');
                } catch {
                    pushToast('Xóa thất bại', 'error');
                }
            },
        });
    };

    const handleRestore = async (user: UserResponse) => {
        try {
            await restoreUser(user.id).unwrap();
            pushToast('Đã khôi phục tài khoản');
        } catch (err: unknown) {
            const msg =
                typeof err === 'object' &&
                err !== null &&
                'data' in err &&
                typeof (err as { data?: { message?: unknown } }).data?.message === 'string'
                    ? (err as { data: { message: string } }).data.message
                    : 'Khôi phục thất bại';
            pushToast(msg, 'error');
        }
    };

    const handlePermanentDelete = (user: UserResponse) => {
        setConfirmAction({
            title: 'Xóa vĩnh viễn',
            desc: `Tài khoản "${user.email}" sẽ bị xóa VĨNH VIỄN và không thể khôi phục!`,
            danger: true,
            action: async () => {
                try {
                    await permanentDelete(user.id).unwrap();
                    pushToast('Đã xóa vĩnh viễn');
                } catch {
                    pushToast('Xóa thất bại', 'error');
                }
            },
        });
    };

    const handleToggleActive = async (user: UserResponse) => {
        try {
            if (user.isActive) {
                await deactivateUser(user.id).unwrap();
                pushToast('Đã khóa tài khoản');
            } else {
                await activateUser(user.id).unwrap();
                pushToast('Đã mở khóa tài khoản');
            }
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý tài khoản</h1>
                    <p className="page-subtitle">Quản lý người dùng và vai trò hệ thống</p>
                </div>
                <button
                    className="btn btn-primary"
                    id="add-user-btn"
                    onClick={() => setCreateUserOpen(true)}
                >
                    <Plus size={15} /> Thêm người dùng
                </button>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Số lượng tài khoản</p>
                    <p className="stat-value">{isLoading ? '—' : users.length}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đang hoạt động</p>
                    <p className="stat-value" style={{ color: 'var(--green)' }}>{isLoading ? '—' : totalActive}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Không hoạt động</p>
                    <p className="stat-value" style={{ color: 'var(--amber)' }}>{isLoading ? '—' : totalInactive}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đã xóa</p>
                    <p className="stat-value" style={{ color: 'var(--red)' }}>{isLoading ? '—' : totalDeleted}</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <Users size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Danh sách tài khoản
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        {(['all', 'active', 'inactive', 'deleted'] as const).map((f) => (
                            <button
                                key={f}
                                id={`filter-${f}`}
                                className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => { setFilterStatus(f); setPage(0); }}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'active' ? 'Hoạt động' : f === 'inactive' ? 'Không HĐ' : 'Đã xóa'}
                            </button>
                        ))}
                        <div className="toolbar-search">
                            <Search size={14} className="toolbar-search-icon" />
                            <input
                                id="accounts-search"
                                className="toolbar-search-input"
                                placeholder="Tìm email, tên, role…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            />
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Nhân viên</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">
                                        <Users size={40} className="empty-icon" />
                                        <p className="empty-text">Không tìm thấy tài khoản nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <span className="td-primary">{user.email}</span>
                                        </div>
                                    </td>
                                    <td>{user.employee?.fullName ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>
                                        <div className="role-list">
                                            <UserRolesCell userId={user.id} />
                                        </div>
                                    </td>
                                    <td>
                                        {user.isDeleted ? (
                                            <span className="badge badge-red">Đã xóa</span>
                                        ) : user.isActive ? (
                                            <span className="badge badge-green">Hoạt động</span>
                                        ) : (
                                            <span className="badge badge-amber">Không HĐ</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {!user.isDeleted ? (
                                                <>
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        title="Gán quyền"
                                                        id={`manage-role-${user.id}`}
                                                        onClick={() => setRoleManagerUser(user)}
                                                        style={{ color: 'var(--accent-light)' }}
                                                    >
                                                        <ShieldCheck size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                                        id={`toggle-user-${user.id}`}
                                                        onClick={() => handleToggleActive(user)}
                                                        style={{ color: user.isActive ? 'var(--amber)' : 'var(--green)' }}
                                                    >
                                                        {user.isActive ? <Lock size={15} /> : <Unlock size={15} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-danger-subtle"
                                                        title="Xóa tài khoản"
                                                        id={`delete-${user.id}`}
                                                        onClick={() => handleDelete(user)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        title="Khôi phục"
                                                        id={`restore-${user.id}`}
                                                        onClick={() => handleRestore(user)}
                                                        style={{ color: 'var(--blue)' }}
                                                    >
                                                        <RotateCcw size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-danger"
                                                        title="Xóa vĩnh viễn"
                                                        id={`perm-delete-${user.id}`}
                                                        onClick={() => handlePermanentDelete(user)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <span className="page-info">
                            Trang {page + 1} / {meta.totalPages} — {meta.totalItems} tài khoản
                        </span>
                        <button className="page-btn" disabled={page === 0} onClick={() => setPage(page - 1)} id="prev-page">
                            <ChevronLeft size={15} />
                        </button>
                        {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => (
                            <button
                                key={i}
                                className={`page-btn ${i === page ? 'active' : ''}`}
                                id={`page-${i}`}
                                onClick={() => setPage(i)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button className="page-btn" disabled={page >= meta.totalPages - 1} onClick={() => setPage(page + 1)} id="next-page">
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>

            {roleManagerUser && (
                <RoleManagerModal
                    user={roleManagerUser}
                    onClose={() => setRoleManagerUser(null)}
                    pushToast={pushToast}
                />
            )}
            {createUserOpen && (
                <CreateUserModal
                    onClose={() => setCreateUserOpen(false)}
                    pushToast={pushToast}
                />
            )}
            {confirmAction && (
                <ConfirmModal
                    title={confirmAction.title}
                    desc={confirmAction.desc}
                    danger={confirmAction.danger}
                    onConfirm={confirmAction.action}
                    onClose={() => setConfirmAction(null)}
                />
            )}

            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        {t.type === 'success' ? <UserCheck size={16} /> : <UserX size={16} />}
                        {t.msg}
                    </div>
                ))}
            </div>
        </>
    );
}
