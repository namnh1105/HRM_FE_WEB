'use client';

import React, { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Users, X } from 'lucide-react';
import {
    useCreateEmployeeMutation,
    useGetEmployeesQuery,
    useUpdateEmployeeMutation,
} from '@/store/api/hrApi';
import type { EmploymentStatus } from '@/types/hr';
import ResourceTable, { extractRowsAndMeta, type ColumnDef } from '@/components/ResourceTable';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import DataTable from '@/components/ui/DataTable';
import { FilterPills, SearchBox } from '@/components/ui/ToolbarControls';
import { useToast } from '@/hooks/useToast';
import ToastStack from '@/components/ToastStack';

type Row = Record<string, unknown>;

function rowStringId(row: Row): string | null {
    const id = row.id;
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
    return null;
}

function EmployeeDetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
    const entries = Object.entries(row).filter(([k]) => {
        const low = k.toLowerCase();
        return low !== 'password' && !low.includes('secret');
    });
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">Thông tin nhân viên</p>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body" style={{ display: 'grid', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
                    {entries.map(([k, v]) => (
                        <div key={k} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                                {v === null || v === undefined ? '—' : String(v)}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmployeeFormModal({
    mode,
    initial,
    onClose,
    onSaved,
    pushToast,
}: {
    mode: 'create' | 'edit';
    initial: Row | null;
    onClose: () => void;
    onSaved: () => void;
    pushToast: (msg: string, type?: 'success' | 'error') => void;
}) {
    const [fullName, setFullName] = useState(String(initial?.fullName ?? ''));
    const [email, setEmail] = useState(String(initial?.email ?? ''));
    const [phone, setPhone] = useState(String(initial?.phone ?? ''));
    const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>(
        String(initial?.employmentStatus ?? 'ACTIVE').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'
    );
    const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
    const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
    const id = initial ? rowStringId(initial) : null;

    const handleSubmit = async () => {
        if (!fullName.trim() || !email.trim()) {
            pushToast('Vui lòng nhập họ tên và email', 'error');
            return;
        }
        try {
            if (mode === 'create') {
                await createEmployee({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    employmentStatus,
                    phone: phone.trim() || undefined,
                }).unwrap();
                pushToast('Đã thêm nhân viên');
            } else if (id) {
                await updateEmployee({
                    id,
                    body: {
                        fullName: fullName.trim(),
                        email: email.trim(),
                        employmentStatus,
                        phone: phone.trim() || undefined,
                    },
                }).unwrap();
                pushToast('Đã cập nhật nhân viên');
            }
            onSaved();
            onClose();
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{mode === 'create' ? 'Thêm nhân viên' : 'Sửa nhân viên'}</p>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Họ và tên</label>
                        <input className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Email</label>
                        <input
                            className="field-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Điện thoại</label>
                        <input className="field-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Trạng thái</label>
                        <select
                            className="field-input"
                            value={employmentStatus}
                            onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
                        >
                            <option value="ACTIVE">Đang làm việc</option>
                            <option value="INACTIVE">Không hoạt động</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={creating || updating}
                        onClick={() => void handleSubmit()}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EmployeesResourceView() {
    const { toasts, push } = useToast();
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching, refetch } = useGetEmployeesQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [detailRow, setDetailRow] = useState<Row | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow] = useState<Row | null>(null);

    const columns: ColumnDef[] = useMemo(
        () => [
            { key: 'fullName', label: 'Họ và tên' },
            { key: 'email', label: 'Email' },
            { key: 'employmentStatus', label: 'Trạng thái' },
            { key: 'createdAt', label: 'Ngày tạo' },
            { key: 'updatedAt', label: 'Cập nhật' },
        ],
        []
    );

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const isActive = (r: Row) => String(r.employmentStatus ?? '').toUpperCase() === 'ACTIVE';
        const activeCount = list.filter(isActive).length;
        const inactiveCount = list.length - activeCount;

        let out = list;
        if (filterStatus === 'active') out = out.filter(isActive);
        if (filterStatus === 'inactive') out = out.filter((r) => !isActive(r));

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter(
                (r) =>
                    String(r.fullName ?? '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.email ?? '')
                        .toLowerCase()
                        .includes(q)
            );
        }

        return {
            filtered: out,
            stats: { total: list.length, active: activeCount, inactive: inactiveCount },
        };
    }, [rows, search, filterStatus]);

    return (
        <>
            <PageHeader
                title="Nhân viên"
                subtitle="Quản lý danh sách nhân viên theo trạng thái và tìm kiếm nhanh."
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormMode('create')}>
                        <Plus size={14} /> Thêm nhân viên
                    </button>
                }
            />

            <StatCards
                items={[
                    { label: 'Tổng nhân viên', value: isLoading ? '—' : stats.total },
                    { label: 'Đang làm việc', value: isLoading ? '—' : stats.active, tone: 'green' },
                    { label: 'Không hoạt động', value: isLoading ? '—' : stats.inactive, tone: 'amber' },
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
                                { id: 'inactive', label: 'Không hoạt động' },
                            ]}
                            value={filterStatus}
                            onChange={(v) => {
                                setFilterStatus(v);
                                setPage(0);
                            }}
                        />
                        <SearchBox
                            placeholder="Tìm tên, email…"
                            value={search}
                            onChange={(v) => {
                                setSearch(v);
                                setPage(0);
                            }}
                        />
                    </>
                }
                pagination={
                    meta
                        ? {
                              page,
                              totalPages: Math.max(1, meta.totalPages),
                              totalItems: meta.totalItems,
                              itemLabel: 'bản ghi',
                              onPageChange: setPage,
                          }
                        : null
                }
            >
                <div style={{ padding: 16 }}>
                    <ResourceTable
                        rows={filtered}
                        loading={isLoading}
                        columns={columns}
                        actions={(row) => (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-ghost"
                                    onClick={() => setDetailRow(row)}
                                >
                                    <Eye size={14} /> Xem
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    disabled={!rowStringId(row)}
                                    onClick={() => {
                                        setEditRow(row);
                                        setFormMode('edit');
                                    }}
                                >
                                    <Pencil size={14} /> Sửa
                                </button>
                            </div>
                        )}
                    />
                </div>
            </DataTable>

            {detailRow ? <EmployeeDetailModal row={detailRow} onClose={() => setDetailRow(null)} /> : null}
            {formMode ? (
                <EmployeeFormModal
                    key={formMode === 'edit' && editRow ? rowStringId(editRow) ?? 'edit' : 'create'}
                    mode={formMode}
                    initial={formMode === 'edit' ? editRow : null}
                    onClose={() => {
                        setFormMode(null);
                        setEditRow(null);
                    }}
                    onSaved={() => void refetch()}
                    pushToast={push}
                />
            ) : null}
            <ToastStack toasts={toasts} />
        </>
    );
}
