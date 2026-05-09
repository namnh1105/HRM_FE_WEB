'use client';

import React, { useMemo, useState } from 'react';
import { Clock3, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
    useCreateWorkShiftMutation,
    useDeleteWorkShiftMutation,
    useGetWorkShiftsQuery,
    useUpdateWorkShiftMutation,
} from '@/store/api/hrApi';
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

function WorkShiftFormModal({
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
    const [name, setName] = useState(String(initial?.name ?? ''));
    const [startTime, setStartTime] = useState(String(initial?.startTime ?? '08:00'));
    const [endTime, setEndTime] = useState(String(initial?.endTime ?? '17:00'));
    const [enabled, setEnabled] = useState(() => {
        const v = initial?.enabled;
        if (typeof v === 'boolean') return v;
        return String(v ?? 'true').toLowerCase() !== 'false';
    });
    const [createShift, { isLoading: creating }] = useCreateWorkShiftMutation();
    const [updateShift, { isLoading: updating }] = useUpdateWorkShiftMutation();
    const id = initial ? rowStringId(initial) : null;

    const handleSubmit = async () => {
        if (!name.trim()) {
            pushToast('Vui lòng nhập tên ca', 'error');
            return;
        }
        try {
            if (mode === 'create') {
                await createShift({
                    name: name.trim(),
                    startTime: startTime.trim(),
                    endTime: endTime.trim(),
                    enabled,
                }).unwrap();
                pushToast('Đã thêm ca làm');
            } else if (id) {
                await updateShift({
                    id,
                    body: {
                        name: name.trim(),
                        startTime: startTime.trim(),
                        endTime: endTime.trim(),
                        enabled,
                    },
                }).unwrap();
                pushToast('Đã cập nhật ca làm');
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
                    <p className="modal-title">{mode === 'create' ? 'Thêm ca làm' : 'Sửa ca làm'}</p>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Tên ca</label>
                        <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Giờ vào</label>
                        <input
                            className="field-input"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Giờ ra</label>
                        <input
                            className="field-input"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                    </div>
                    <div className="field-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <input
                            id="ws-enabled"
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <label htmlFor="ws-enabled" className="field-label" style={{ margin: 0 }}>
                            Kích hoạt
                        </label>
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

function ConfirmDeleteModal({
    title,
    onConfirm,
    onClose,
}: {
    title: string;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">Xóa ca làm</p>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{title}</p>
                <div className="modal-footer">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function WorkShiftsResourceView() {
    const { toasts, push } = useToast();
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching, refetch } = useGetWorkShiftsQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
    const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow] = useState<Row | null>(null);
    const [deleteRow, setDeleteRow] = useState<Row | null>(null);
    const [deleteShift, { isLoading: isDeleting }] = useDeleteWorkShiftMutation();

    const columns: ColumnDef[] = useMemo(
        () => [
            { key: 'name', label: 'Tên ca' },
            { key: 'startTime', label: 'Giờ vào' },
            { key: 'endTime', label: 'Giờ ra' },
            { key: 'enabled', label: 'Kích hoạt' },
            { key: 'createdAt', label: 'Ngày tạo' },
        ],
        []
    );

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const isEnabled = (r: Row) => {
            const v = r.enabled;
            if (typeof v === 'boolean') return v;
            return String(v).toLowerCase() === 'true' || String(v).toLowerCase() === 'enabled';
        };
        const enabledCount = list.filter(isEnabled).length;
        const disabledCount = list.length - enabledCount;
        let out = list;
        if (filter === 'enabled') out = out.filter(isEnabled);
        if (filter === 'disabled') out = out.filter((r) => !isEnabled(r));
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter((r) => String(r.name ?? '').toLowerCase().includes(q));
        }
        return { filtered: out, stats: { total: list.length, enabled: enabledCount, disabled: disabledCount } };
    }, [rows, filter, search]);

    const handleDelete = async (row: Row) => {
        const id = rowStringId(row);
        if (!id) return;
        try {
            await deleteShift(id).unwrap();
            push('Đã xóa ca làm');
            void refetch();
        } catch {
            push('Xóa thất bại', 'error');
        }
    };

    return (
        <>
            <PageHeader
                title="Ca làm"
                subtitle="Danh sách ca làm, thêm / sửa / xóa và lọc theo trạng thái."
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormMode('create')}>
                        <Plus size={14} /> Thêm ca
                    </button>
                }
            />

            <StatCards
                items={[
                    { label: 'Tổng ca', value: isLoading ? '—' : stats.total },
                    { label: 'Đang bật', value: isLoading ? '—' : stats.enabled, tone: 'green' },
                    { label: 'Đang tắt', value: isLoading ? '—' : stats.disabled, tone: 'amber' },
                ]}
            />

            <DataTable
                title="Danh sách ca làm"
                titleIcon={Clock3}
                isFetching={isFetching}
                toolbarRight={
                    <>
                        <FilterPills
                            options={[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'enabled', label: 'Đang bật' },
                                { id: 'disabled', label: 'Đang tắt' },
                            ]}
                            value={filter}
                            onChange={(v) => {
                                setFilter(v);
                                setPage(0);
                            }}
                        />
                        <SearchBox
                            placeholder="Tìm tên ca…"
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
                                    className="btn btn-sm btn-primary"
                                    disabled={!rowStringId(row)}
                                    onClick={() => {
                                        setEditRow(row);
                                        setFormMode('edit');
                                    }}
                                >
                                    <Pencil size={14} /> Sửa
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger"
                                    disabled={!rowStringId(row) || isDeleting}
                                    onClick={() => setDeleteRow(row)}
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        )}
                    />
                </div>
            </DataTable>

            {formMode ? (
                <WorkShiftFormModal
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

            {deleteRow ? (
                <ConfirmDeleteModal
                    title={`Bạn có chắc muốn xóa ca "${String(deleteRow.name ?? '')}"?`}
                    onClose={() => setDeleteRow(null)}
                    onConfirm={() => void handleDelete(deleteRow)}
                />
            ) : null}

            <ToastStack toasts={toasts} />
        </>
    );
}
