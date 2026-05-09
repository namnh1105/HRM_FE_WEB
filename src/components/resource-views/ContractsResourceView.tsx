'use client';

import React, { useMemo, useState } from 'react';
import { FileText, Pencil, Plus, X } from 'lucide-react';
import { useCreateContractMutation, useGetContractsQuery, useUpdateContractMutation } from '@/store/api/hrApi';
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

function pickEmployeeId(row: Row): string {
    const a = row.employeeId;
    if (typeof a === 'string') return a;
    const emp = row.employee;
    if (emp && typeof emp === 'object' && emp !== null && 'id' in emp) {
        const b = (emp as { id?: unknown }).id;
        if (typeof b === 'string') return b;
    }
    return '';
}

function ContractFormModal({
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
    const [code, setCode] = useState(String(initial?.code ?? ''));
    const [employeeId, setEmployeeId] = useState(mode === 'edit' && initial ? pickEmployeeId(initial) : '');
    const [type, setType] = useState(String(initial?.type ?? 'FULL_TIME'));
    const [startDate, setStartDate] = useState(
        String(initial?.startDate ?? '').slice(0, 10) || new Date().toISOString().slice(0, 10)
    );
    const [endDate, setEndDate] = useState(
        initial?.endDate ? String(initial.endDate).slice(0, 10) : ''
    );
    const [status, setStatus] = useState(String(initial?.status ?? 'ACTIVE'));
    const [createContract, { isLoading: creating }] = useCreateContractMutation();
    const [updateContract, { isLoading: updating }] = useUpdateContractMutation();
    const id = initial ? rowStringId(initial) : null;

    const handleSubmit = async () => {
        if (!code.trim()) {
            pushToast('Vui lòng nhập mã hợp đồng', 'error');
            return;
        }
        if (mode === 'create' && !employeeId.trim()) {
            pushToast('Vui lòng nhập ID nhân viên (UUID)', 'error');
            return;
        }
        try {
            if (mode === 'create') {
                await createContract({
                    code: code.trim(),
                    employeeId: employeeId.trim(),
                    type: type.trim(),
                    startDate: startDate.trim(),
                    endDate: endDate.trim() || undefined,
                    status: status.trim() || undefined,
                }).unwrap();
                pushToast('Đã thêm hợp đồng');
            } else if (id) {
                await updateContract({
                    id,
                    body: {
                        code: code.trim(),
                        type: type.trim(),
                        startDate: startDate.trim(),
                        endDate: endDate.trim() || undefined,
                        status: status.trim() || undefined,
                        ...(employeeId.trim() ? { employeeId: employeeId.trim() } : {}),
                    },
                }).unwrap();
                pushToast('Đã cập nhật hợp đồng');
            }
            onSaved();
            onClose();
        } catch {
            pushToast('Thao tác thất bại', 'error');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{mode === 'create' ? 'Thêm hợp đồng' : 'Sửa hợp đồng'}</p>
                    <button type="button" className="btn btn-icon btn-ghost" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Mã hợp đồng</label>
                        <input className="field-input" value={code} onChange={(e) => setCode(e.target.value)} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">ID nhân viên (UUID)</label>
                        <input
                            className="field-input"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="employeeId"
                            disabled={mode === 'edit'}
                        />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Loại</label>
                        <input className="field-input" value={type} onChange={(e) => setType(e.target.value)} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Từ ngày</label>
                        <input
                            className="field-input"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Đến ngày (tuỳ chọn)</label>
                        <input
                            className="field-input"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Trạng thái</label>
                        <input className="field-input" value={status} onChange={(e) => setStatus(e.target.value)} />
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

export default function ContractsResourceView() {
    const { toasts, push } = useToast();
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching, refetch } = useGetContractsQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
    const [editRow, setEditRow] = useState<Row | null>(null);

    const columns: ColumnDef[] = useMemo(
        () => [
            { key: 'code', label: 'Mã HĐ' },
            { key: 'employeeName', label: 'Nhân viên' },
            { key: 'type', label: 'Loại' },
            { key: 'startDate', label: 'Từ ngày' },
            { key: 'endDate', label: 'Đến ngày' },
            { key: 'status', label: 'Trạng thái' },
        ],
        []
    );

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const isActive = (r: Row) => String(r.status ?? '').toUpperCase().includes('ACTIVE');
        const activeCount = list.filter(isActive).length;
        const inactiveCount = list.length - activeCount;
        let out = list;
        if (filter === 'active') out = out.filter(isActive);
        if (filter === 'inactive') out = out.filter((r) => !isActive(r));
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter(
                (r) =>
                    String(r.code ?? '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.employeeName ?? '')
                        .toLowerCase()
                        .includes(q)
            );
        }
        return { filtered: out, stats: { total: list.length, active: activeCount, inactive: inactiveCount } };
    }, [rows, filter, search]);

    return (
        <>
            <PageHeader
                title="Hợp đồng"
                subtitle="Danh sách, thêm và cập nhật hợp đồng lao động."
                actions={
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormMode('create')}>
                        <Plus size={14} /> Thêm hợp đồng
                    </button>
                }
            />

            <StatCards
                items={[
                    { label: 'Tổng hợp đồng', value: isLoading ? '—' : stats.total },
                    { label: 'Đang hiệu lực', value: isLoading ? '—' : stats.active, tone: 'green' },
                    { label: 'Không hiệu lực', value: isLoading ? '—' : stats.inactive, tone: 'amber' },
                ]}
            />

            <DataTable
                title="Danh sách hợp đồng"
                titleIcon={FileText}
                isFetching={isFetching}
                toolbarRight={
                    <>
                        <FilterPills
                            options={[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'active', label: 'Hiệu lực' },
                                { id: 'inactive', label: 'Không hiệu lực' },
                            ]}
                            value={filter}
                            onChange={(v) => {
                                setFilter(v);
                                setPage(0);
                            }}
                        />
                        <SearchBox
                            placeholder="Tìm mã HĐ, nhân viên…"
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
                        )}
                    />
                </div>
            </DataTable>

            {formMode ? (
                <ContractFormModal
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
