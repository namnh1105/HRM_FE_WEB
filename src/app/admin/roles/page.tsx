'use client';
import React, { useState, useMemo } from 'react';
import {
    useGetAllRolesQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useActivateRoleMutation,
    useDeactivateRoleMutation,
    useGetRoleByIdQuery,
    useSyncPermissionsToRoleMutation,
} from '@/store/api/roleApi';
import {
    ChevronDown,
    ChevronRight,
    Lock,
    Unlock,
    RotateCcw,
    ShieldCheck,
    Search,
    Plus,
    Shield,
    Trash2,
    Pencil,
    ToggleLeft,
    ToggleRight,
    X,
    Key,
    ChevronLeft,
    UserCheck,
    UserX,
    CheckSquare,
    Square
} from 'lucide-react';
import { useGetActivePermissionsQuery } from '@/store/api/permissionApi';
import type { RoleResponse, CreateRoleRequest, UpdateRoleRequest } from '@/types';

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
    const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);
    const push = (msg: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };
    return { toasts, push };
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────
function RoleFormModal({
    initial,
    onClose,
    pushToast,
}: {
    initial?: RoleResponse;
    onClose: () => void;
    pushToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const [form, setForm] = useState({
        code: initial?.code ?? '',
        displayName: initial?.displayName ?? '',
        description: initial?.description ?? '',
        isActive: initial?.isActive ?? true,
    });
    const [createRole, { isLoading: creating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

    const busy = creating || updating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.code.trim() || !form.displayName.trim()) return;
        try {
            if (initial) {
                await updateRole({ roleId: initial.id, body: form }).unwrap();
                pushToast('Đã cập nhật role');
            } else {
                await createRole(form).unwrap();
                pushToast('Đã tạo role mới');
            }
            onClose();
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{initial ? 'Cập nhật Role' : 'Tạo Role mới'}</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="field-group">
                            <label className="field-label">Mã code *</label>
                            <input
                                id="role-code-input"
                                className="field-input"
                                placeholder="vd: ROLE_MANAGER"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label className="field-label">Tên hiển thị *</label>
                            <input
                                id="role-name-input"
                                className="field-input"
                                placeholder="vd: Quản lý cửa hàng"
                                value={form.displayName}
                                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="field-group">
                            <label className="field-label">Mô tả</label>
                            <input
                                id="role-desc-input"
                                className="field-input"
                                placeholder="Mô tả ngắn về role"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
                            />
                            <span style={{ color: 'var(--text-secondary)' }}>Kích hoạt ngay</span>
                        </label>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary" id="role-submit-btn" disabled={busy}>
                            {busy ? 'Đang lưu…' : initial ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Permission Manager Modal ─────────────────────────────────────────────────
// ─── Permission Manager Modal ─────────────────────────────────────────────────
function PermissionManagerModal({
    role,
    onClose,
    pushToast,
}: {
    role: RoleResponse;
    onClose: () => void;
    pushToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const { data: roleData, isLoading: roleLoading } = useGetRoleByIdQuery(role.id);
    const { data: allPermsData, isLoading: permsLoading } = useGetActivePermissionsQuery();
    const [syncPermissions, { isLoading: saving }] = useSyncPermissionsToRoleMutation();
    const [permSearch, setPermSearch] = useState('');
    
    // Local state for selected permission IDs
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
        const perms = role.permissions ?? [];
        return new Set(perms.map(p => {
            if (typeof p === 'string') return p;
            return (p as any)?.id;
        }).filter(Boolean));
    });

    // Sync local state when roleData (full fetch) is loaded
    React.useEffect(() => {
        if (roleData?.data?.permissions) {
            const ids = roleData.data.permissions.map(p => p.id);
            setSelectedIds(new Set(ids));
        }
    }, [roleData]);

    const filteredPerms = useMemo(() => {
        const all = allPermsData?.data ?? [];
        if (!permSearch.trim()) return all;
        const q = permSearch.toLowerCase();
        return all.filter(
            (p) =>
                p.code.toLowerCase().includes(q) ||
                p.displayName.toLowerCase().includes(q) ||
                p.resource.toLowerCase().includes(q)
        );
    }, [allPermsData, permSearch]);

    // Local state for expanded/collapsed resources
    const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

    const toggleResource = (resource: string) => {
        setExpandedResources(prev => {
            const next = new Set(prev);
            if (next.has(resource)) next.delete(resource);
            else next.add(resource);
            return next;
        });
    };

    const grouped = useMemo(() => {
        const map: Record<string, typeof filteredPerms> = {};
        filteredPerms.forEach((p) => {
            if (!map[p.resource]) map[p.resource] = [];
            map[p.resource].push(p);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filteredPerms]);

    // Auto expand first group
    React.useEffect(() => {
        if (!permSearch && grouped.length > 0 && expandedResources.size === 0) {
            setExpandedResources(new Set([grouped[0][0]]));
        }
    }, [grouped, permSearch]);

    const handleToggle = (permId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(permId)) next.delete(permId);
            else next.add(permId);
            return next;
        });
    };

    const handleSave = async () => {
        try {
            await syncPermissions({ 
                roleId: role.id, 
                permissionIds: Array.from(selectedIds) 
            }).unwrap();
            pushToast('Đã cập nhật danh sách quyền');
            onClose();
        } catch (err: any) {
            const msg = err?.data?.message || 'Cập nhật thất bại';
            pushToast(msg, 'error');
        }
    };

    const isLoading = roleLoading || permsLoading;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <p className="modal-title">Quản lý Quyền — {role.displayName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Đã chọn <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{selectedIds.size}</span> quyền
                        </p>
                    </div>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                    <div className="toolbar-search" style={{ width: '100%' }}>
                        <Search size={14} className="toolbar-search-icon" />
                        <input
                            id="perm-manager-search"
                            className="toolbar-search-input"
                            style={{ width: '100%' }}
                            placeholder="Tìm quyền…"
                            value={permSearch}
                            onChange={(e) => setPermSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />
                        ))
                    ) : grouped.length === 0 ? (
                        <div className="empty-state"><p className="empty-text">Không có quyền nào khớp</p></div>
                    ) : (
                        grouped.map(([resource, perms]) => {
                            const isExpanded = expandedResources.has(resource) || !!permSearch;
                            return (
                                <div key={resource} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
                                    <div 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px',
                                            cursor: 'pointer', userSelect: 'none'
                                        }}
                                        onClick={() => toggleResource(resource)}
                                    >
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent-light)', flex: 1 }}>
                                            {resource}
                                        </p>
                                        <span className="badge badge-gray" style={{ fontSize: 9 }}>{perms.length}</span>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                                            gap: 8, 
                                            marginTop: 8,
                                            paddingLeft: 22
                                        }}>
                                            {perms.map((perm) => {
                                                const has = selectedIds.has(perm.id);
                                                return (
                                                    <div
                                                        key={perm.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 10,
                                                            padding: '10px 12px',
                                                            borderRadius: 8,
                                                            background: has ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                                                            cursor: 'pointer',
                                                            border: `1px solid ${has ? 'var(--accent-light)' : 'var(--border)'}`,
                                                            transition: 'all 0.15s',
                                                        }}
                                                        id={`toggle-perm-${perm.id}`}
                                                        onClick={() => handleToggle(perm.id)}
                                                    >
                                                        {has ? (
                                                            <CheckSquare size={16} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
                                                        ) : (
                                                            <Square size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                        )}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                                                                {perm.displayName}
                                                            </p>
                                                            <code style={{ fontSize: 10, color: 'var(--text-muted)' }}>{perm.code}</code>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="modal-footer" style={{ marginTop: 20 }}>
                    <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isLoading || saving}>
                        {saving ? 'Đang lưu…' : 'Cập nhật quyền'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPage() {
    const [page, setPage] = useState(0);
    const { data, isLoading, isFetching } = useGetAllRolesQuery({ page, size: 10 });
    const [deleteRole] = useDeleteRoleMutation();
    const [activateRole] = useActivateRoleMutation();
    const [deactivateRole] = useDeactivateRoleMutation();

    const [search, setSearch] = useState('');
    const [formModal, setFormModal] = useState<{ open: boolean; role?: RoleResponse }>({ open: false });
    const [permModal, setPermModal] = useState<RoleResponse | null>(null);
    const { toasts, push: pushToast } = useToast();

    const roles = data?.data ?? [];
    const meta = data?.meta;

    const filtered = useMemo(() => {
        if (!search.trim()) return roles;
        const q = search.toLowerCase();
        return roles.filter(
            (r) =>
                r.code.toLowerCase().includes(q) ||
                r.displayName.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q)
        );
    }, [roles, search]);

    const handleDelete = async (role: RoleResponse) => {
        if (!confirm(`Xóa role "${role.displayName}"?`)) return;
        try {
            await deleteRole(role.id).unwrap();
            pushToast('Đã xóa role');
        } catch {
            pushToast('Xóa thất bại', 'error');
        }
    };

    const handleToggleActive = async (role: RoleResponse) => {
        try {
            if (role.isActive) {
                await deactivateRole(role.id).unwrap();
                pushToast('Đã vô hiệu hóa');
            } else {
                await activateRole(role.id).unwrap();
                pushToast('Đã kích hoạt');
            }
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Quản lý vai trò</h1>
                    <p className="page-subtitle">Tạo và cấu hình các vai trò trong hệ thống</p>
                </div>
                <button className="btn btn-primary" id="create-role-btn" onClick={() => setFormModal({ open: true })}>
                    <Plus size={15} /> Tạo Role mới
                </button>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Tổng Roles</p>
                    <p className="stat-value">{meta?.totalElements ?? '—'}</p>
                    <p className="stat-sub">Tất cả vai trò</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đang hoạt động</p>
                    <p className="stat-value" style={{ color: 'var(--green)' }}>
                        {roles.filter((r) => r.isActive).length}
                    </p>
                    <p className="stat-sub">Roles kích hoạt</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Hệ thống</p>
                    <p className="stat-value" style={{ color: 'var(--accent-light)' }}>
                        {roles.filter((r) => r.isSystem).length}
                    </p>
                    <p className="stat-sub">Built-in roles</p>
                </div>
            </div>

            {/* Table */}
            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <Shield size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Danh sách Roles
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        <div className="toolbar-search">
                            <Search size={14} className="toolbar-search-icon" />
                            <input
                                id="roles-search"
                                className="toolbar-search-input"
                                placeholder="Tìm role…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Tên role</th>
                            <th>Mô tả</th>
                            <th>Quyền</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((__, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state">
                                        <Shield size={40} className="empty-icon" />
                                        <p className="empty-text">Không có role nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((role) => (
                                <tr key={role.id}>
                                    <td><code style={{ fontSize: 12, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 4 }}>{role.code}</code></td>
                                    <td className="td-primary">{role.displayName}</td>
                                    <td style={{ color: 'var(--text-muted)', maxWidth: 200 }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                                            {role.description ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="badge badge-blue"
                                            style={{ cursor: 'pointer', border: 'none', background: 'rgba(99,102,241,0.12)' }}
                                            id={`manage-perm-${role.id}`}
                                            onClick={() => setPermModal(role)}
                                            title="Quản lý quyền"
                                        >
                                            <Key size={11} />
                                            {(role.permissions ?? []).length} quyền
                                        </button>
                                    </td>
                                    <td>
                                        {role.isSystem ? (
                                            <span className="badge badge-amber">Hệ thống</span>
                                        ) : (
                                            <span className="badge badge-gray">Tùy chỉnh</span>
                                        )}
                                    </td>
                                    <td>
                                        {role.isActive ? (
                                            <span className="badge badge-green">Hoạt động</span>
                                        ) : (
                                            <span className="badge badge-red">Vô hiệu</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {!role.isSystem ? (
                                                <>
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        title="Cập nhật"
                                                        id={`edit-role-${role.id}`}
                                                        onClick={() => setFormModal({ open: true, role })}
                                                        style={{ color: 'var(--accent-light)' }}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        title={role.isActive ? 'Khóa' : 'Mở khóa'}
                                                        id={`toggle-role-${role.id}`}
                                                        onClick={() => handleToggleActive(role)}
                                                        style={{ color: role.isActive ? 'var(--amber)' : 'var(--green)' }}
                                                    >
                                                        {role.isActive ? <Lock size={15} /> : <Unlock size={15} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-danger-subtle"
                                                        title="Xóa"
                                                        id={`delete-role-${role.id}`}
                                                        onClick={() => handleDelete(role)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 8 }}>Mặc định</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <span className="page-info">
                            Trang {page + 1} / {meta.totalPages} — {meta.totalElements} roles
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

            {/* Modals */}
            {formModal.open && (
                <RoleFormModal
                    initial={formModal.role}
                    onClose={() => setFormModal({ open: false })}
                    pushToast={pushToast}
                />
            )}
            {permModal && (
                <PermissionManagerModal
                    role={permModal}
                    onClose={() => setPermModal(null)}
                    pushToast={pushToast}
                />
            )}

            {/* Toasts */}
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
