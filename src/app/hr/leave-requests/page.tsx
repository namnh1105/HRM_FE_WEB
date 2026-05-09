'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search, Calendar } from 'lucide-react';
import {
    useApproveLeaveRequestMutation,
    useCancelLeaveRequestMutation,
    useGetPendingLeaveRequestsQuery,
} from '@/store/api/hrApi';
import HrResourceTable, { extractRowsAndMeta, type HrColumnDef } from '@/components/HrResourceTable';

export default function LeaveRequestsPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching } = useGetPendingLeaveRequestsQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [approve, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
    const [cancel, { isLoading: isCancelling }] = useCancelLeaveRequestMutation();
    const [search, setSearch] = useState('');

    const columns: HrColumnDef[] = useMemo(() => ([
        { key: 'employeeName', label: 'Nhân viên' },
        { key: 'type', label: 'Loại nghỉ' },
        { key: 'startDate', label: 'Từ ngày' },
        { key: 'endDate', label: 'Đến ngày' },
        { key: 'reason', label: 'Lý do' },
        { key: 'status', label: 'Trạng thái' },
    ]), []);

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const pendingCount = list.length;
        let out = list;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter((r) =>
                String(r.employeeName ?? '').toLowerCase().includes(q) ||
                String(r.reason ?? '').toLowerCase().includes(q)
            );
        }
        return { filtered: out, stats: { pending: pendingCount } };
    }, [rows, search]);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Nghỉ phép</h1>
                    <p className="page-subtitle">Duyệt yêu cầu nghỉ phép (pending) theo luồng HR.</p>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Chờ duyệt</p>
                    <p className="stat-value" style={{ color: 'var(--amber)' }}>{isLoading ? '—' : stats.pending}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Ghi chú</p>
                    <p className="stat-sub">Duyệt / hủy áp dụng theo API `approve` và `cancel`</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <Calendar size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Danh sách yêu cầu
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        <div className="toolbar-search">
                            <Search size={14} className="toolbar-search-icon" />
                            <input
                                className="toolbar-search-input"
                                placeholder="Tìm nhân viên, lý do…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            />
                        </div>
                        <span className="page-info">
                            {meta ? `Trang ${page + 1}/${meta.totalPages} - ${meta.totalItems} bản ghi` : `${filtered.length} bản ghi`}
                        </span>
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    <HrResourceTable
                        rows={filtered}
                        loading={isLoading}
                        columns={columns}
                        actions={(row) => {
                            const id = typeof row.id === 'string' ? row.id : null;
                            return (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        type="button"
                                        disabled={!id || isApproving || isCancelling}
                                        onClick={() => id && approve(id).unwrap().catch(() => {})}
                                        title="Duyệt"
                                    >
                                        <CheckCircle2 size={14} /> Duyệt
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        type="button"
                                        disabled={!id || isApproving || isCancelling}
                                        onClick={() => id && cancel(id).unwrap().catch(() => {})}
                                        title="Từ chối / Hủy"
                                    >
                                        <XCircle size={14} /> Hủy
                                    </button>
                                </div>
                            );
                        }}
                    />
                </div>
                {meta && meta.totalPages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft size={15} />
                        </button>
                        <button className="page-btn" disabled={page >= meta.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
