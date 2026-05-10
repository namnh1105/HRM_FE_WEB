'use client';

import React, { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Users, X } from 'lucide-react';
import {
    useCreateEmployeeMutation,
    useGetEmployeesQuery,
    useUpdateEmployeeMutation,
    useGetEmployeeStatsQuery,
} from '@/store/api/hrApi';
import type { EmploymentStatus } from '@/types/hr';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import DataTable from '@/components/ui/DataTable';
import { FilterPills, SearchBox } from '@/components/ui/ToolbarControls';
import { useToast } from '@/hooks/useToast';
import ToastStack from '@/components/ToastStack';

type EmployeeRow = {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    employmentStatus: string;
    createdAt?: string;
    [key: string]: any;
};

function StatusBadge({ status }: { status?: string }) {
    const s = (status ?? '').toUpperCase();
    if (s === 'ACTIVE') return <span className="badge badge-green">Đang làm việc</span>;
    if (s === 'INACTIVE') return <span className="badge badge-amber">Không hoạt động</span>;
    if (s === 'TERMINATED') return <span className="badge badge-red">Đã nghỉ</span>;
    return <span className="badge badge-gray">{status || '—'}</span>;
}

function formatDate(val: string | undefined) {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString('vi-VN');
}

export default function EmployeesPage() {
    const { toasts, push: pushToast } = useToast();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const { data, isLoading, isFetching, refetch } = useGetEmployeesQuery({ page, size: pageSize });
    
    // Fetch stats
    const { data: statsData } = useGetEmployeeStatsQuery();
    const stats: any = (statsData as any)?.data;
    
    // Đồng bộ cách lấy data và pagination giống Roles page
    const employees = (data as any)?.data ?? [];
    const meta = (data as any)?.pagination;

    const [formModal, setFormModal] = useState<{ open: boolean; employee?: EmployeeRow }>({ open: false });
    const [detailRow, setDetailRow] = useState<EmployeeRow | null>(null);

    const filtered = useMemo(() => {
        let list = [...employees];
        const q = search.toLowerCase();
        if (q) {
            list = list.filter(r => 
                r.fullName?.toLowerCase().includes(q) || 
                r.email?.toLowerCase().includes(q) ||
                r.phone?.toLowerCase().includes(q)
            );
        }
        if (filterStatus === 'active') list = list.filter(r => r.employmentStatus?.toUpperCase() === 'ACTIVE');
        if (filterStatus === 'inactive') list = list.filter(r => r.employmentStatus?.toUpperCase() !== 'ACTIVE');
        return list;
    }, [employees, search, filterStatus]);

    return (
        <>
            <PageHeader
                title="Nhân viên"
                subtitle="Quản lý danh sách nhân viên và hồ sơ"
                actions={
                    <button type="button" className="btn btn-primary" onClick={() => setFormModal({ open: true })}>
                        <Plus size={15} /> Thêm nhân viên
                    </button>
                }
            />

            <StatCards
                items={[
                    { label: 'Tổng nhân viên', value: stats?.total ?? '—' },
                    { label: 'Đang làm việc', value: stats?.active ?? '—', tone: 'green' },
                    { label: 'Thử việc/Nghỉ phép', value: stats?.inactive ?? '—', tone: 'amber' },
                    { label: 'Đã nghỉ việc', value: stats?.deleted ?? '—', tone: 'red' },
                ]}
            />

            <DataTable
                title="Danh sách nhân viên"
                titleIcon={Users}
                isFetching={isFetching}
                toolbarRight={
                    <>
                        <FilterPills
                            options={[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'active', label: 'Đang làm' },
                                { id: 'inactive', label: 'Nghỉ/Khác' },
                            ]}
                            value={filterStatus}
                            onChange={(v) => { setFilterStatus(v); setPage(0); }}
                        />
                        <SearchBox
                            placeholder="Tìm tên, email..."
                            value={search}
                            onChange={(v) => { setSearch(v); setPage(0); }}
                        />
                    </>
                }
                pagination={
                    meta ? {
                        page,
                        totalPages: meta.totalPages,
                        totalItems: meta.totalItems,
                        itemLabel: 'nhân viên',
                        onPageChange: setPage,
                        pageSize,
                        onPageSizeChange: (s) => { setPageSize(s); setPage(0); }
                    } : null
                }
            >
                <table>
                    <thead>
                        <tr>
                            <th>Họ và tên</th>
                            <th>Email</th>
                            <th>Điện thoại</th>
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
                                        <p className="empty-text">Không tìm thấy nhân viên nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row) => (
                                <tr key={row.id}>
                                    <td className="td-primary">{row.fullName}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{row.email}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{row.phone || '—'}</td>
                                    <td><StatusBadge status={row.employmentStatus} /></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(row.createdAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-sm btn-ghost" onClick={() => setDetailRow(row)}>
                                                <Eye size={14} /> Xem
                                            </button>
                                            <button className="btn btn-sm btn-primary" onClick={() => setFormModal({ open: true, employee: row })}>
                                                <Pencil size={14} /> Sửa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </DataTable>

            {/* Modals - Giữ lại Logic Form tương ứng */}
            {formModal.open && (
                <EmployeeFormModal 
                    initial={formModal.employee} 
                    onClose={() => setFormModal({ open: false })} 
                    onSaved={refetch}
                    pushToast={pushToast}
                />
            )}
            {detailRow && (
                <EmployeeDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
            )}

            <ToastStack toasts={toasts} />
        </>
    );
}

// --- Internal components for form/detail (giống cách làm trang roles nếu cần tách) ---
function EmployeeFormModal({ initial, onClose, onSaved, pushToast }: any) {
    const [create] = useCreateEmployeeMutation();
    const [update] = useUpdateEmployeeMutation();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        fullName: initial?.fullName || '',
        email: initial?.email || '',
        phone: initial?.phone || '',
        employmentStatus: initial?.employmentStatus || 'ACTIVE'
    });

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.email) return pushToast('Vui lòng điền đủ thông tin', 'error');
        setLoading(true);
        try {
            if (initial?.id) {
                await update({ id: initial.id, body: formData }).unwrap();
                pushToast('Cập nhật thành công');
            } else {
                await create(formData).unwrap();
                pushToast('Thêm mới thành công');
            }
            onSaved();
            onClose();
        } catch {
            pushToast('Thao tác thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{initial ? 'Sửa nhân viên' : 'Thêm nhân viên'}</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Họ và tên</label>
                        <input className="field-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Email</label>
                        <input className="field-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Điện thoại</label>
                        <input className="field-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Trạng thái</label>
                        <select className="field-input" value={formData.employmentStatus} onChange={e => setFormData({...formData, employmentStatus: e.target.value})}>
                            <option value="ACTIVE">Đang làm việc</option>
                            <option value="INACTIVE">Không hoạt động</option>
                            <option value="TERMINATED">Đã nghỉ</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>Lưu</button>
                </div>
            </div>
        </div>
    );
}

function EmployeeDetailModal({ row, onClose }: any) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">Chi tiết nhân viên</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><p className="field-label">Họ tên</p><p>{row.fullName}</p></div>
                    <div><p className="field-label">Email</p><p>{row.email}</p></div>
                    <div><p className="field-label">Điện thoại</p><p>{row.phone || '—'}</p></div>
                    <div><p className="field-label">Trạng thái</p><StatusBadge status={row.employmentStatus} /></div>
                    <div><p className="field-label">ID</p><code style={{fontSize: 11}}>{row.id}</code></div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
}
