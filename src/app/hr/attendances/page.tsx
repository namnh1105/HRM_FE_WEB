'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, LogIn, LogOut, Search } from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation, useGetMyAttendanceHistoryQuery } from '@/store/api/hrApi';
import HrResourceTable, { extractRowsAndMeta, type HrColumnDef } from '@/components/HrResourceTable';

export default function AttendancesPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    const [range, setRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
    const { data, isLoading, isFetching } = useGetMyAttendanceHistoryQuery({ ...range, page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [checkIn, { isLoading: isCheckIn }] = useCheckInMutation();
    const [checkOut, { isLoading: isCheckOut }] = useCheckOutMutation();

    const columns: HrColumnDef[] = useMemo(() => ([
        { key: 'workDate', label: 'Ngày' },
        { key: 'checkInTime', label: 'Giờ vào' },
        { key: 'checkOutTime', label: 'Giờ ra' },
        { key: 'status', label: 'Trạng thái' },
        { key: 'note', label: 'Ghi chú' },
    ]), []);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Chấm công</h1>
                    <p className="page-subtitle">Theo dõi lịch sử chấm công và thao tác check-in / check-out.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-sm btn-primary"
                        type="button"
                        disabled={isCheckIn || isCheckOut}
                        onClick={() => checkIn({}).unwrap().catch(() => {})}
                    >
                        <LogIn size={14} /> Check-in
                    </button>
                    <button
                        className="btn btn-sm btn-ghost"
                        type="button"
                        disabled={isCheckIn || isCheckOut}
                        onClick={() => checkOut({}).unwrap().catch(() => {})}
                    >
                        <LogOut size={14} /> Check-out
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <Search size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Lịch sử chấm công
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        <div className="field-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <input
                                className="field-input"
                                type="date"
                                value={range.startDate}
                                onChange={(e) => { setPage(0); setRange((p) => ({ ...p, startDate: e.target.value })); }}
                                style={{ width: 160 }}
                            />
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                            <input
                                className="field-input"
                                type="date"
                                value={range.endDate}
                                onChange={(e) => { setPage(0); setRange((p) => ({ ...p, endDate: e.target.value })); }}
                                style={{ width: 160 }}
                            />
                        </div>
                        <span className="page-info">
                            {meta ? `Trang ${meta.page + 1}/${meta.totalPages} - ${meta.totalItems} bản ghi` : `${rows.length} bản ghi`}
                        </span>
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    <HrResourceTable rows={rows} loading={isLoading} columns={columns} />
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
