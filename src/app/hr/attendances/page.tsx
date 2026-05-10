'use client';

import React, { useMemo, useState } from 'react';
import { LogIn, LogOut, ClipboardList } from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation, useGetMyAttendanceHistoryQuery } from '@/store/api/hrApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';

type AttendanceRow = {
    id?: string;
    workDate?: string;
    checkInTime?: string;
    checkOutTime?: string;
    status?: string;
};

function formatDate(val: string | undefined) {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('vi-VN');
}

function formatTime(val: string | undefined) {
    if (!val) return '—';
    // HH:mm:ss or full datetime
    if (/^\d{2}:\d{2}/.test(val)) return val.slice(0, 5);
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status?: string }) {
    const s = (status ?? '').toUpperCase();
    if (s === 'PRESENT' || s === 'ON_TIME') return <span className="badge badge-green">Đúng giờ</span>;
    if (s === 'LATE') return <span className="badge badge-amber">Đi muộn</span>;
    if (s === 'ABSENT') return <span className="badge badge-red">Vắng mặt</span>;
    if (s === 'EARLY_LEAVE') return <span className="badge badge-amber">Về sớm</span>;
    if (!status) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    return <span className="badge badge-gray">{status}</span>;
}

export default function AttendancesPage() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [range, setRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
    const { data, isLoading, isFetching } = useGetMyAttendanceHistoryQuery({ ...range, page, size: pageSize });
    const [checkIn, { isLoading: isCheckIn }] = useCheckInMutation();
    const [checkOut, { isLoading: isCheckOut }] = useCheckOutMutation();

    const rows = (data as any)?.data ?? [];
    const meta = (data as any)?.pagination;

    return (
        <>
            <PageHeader
                title="Chấm công"
                subtitle="Theo dõi lịch sử chấm công và thao tác check-in / check-out."
                actions={
                    <>
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
                    </>
                }
            />

            <DataTable
                title="Lịch sử chấm công"
                titleIcon={ClipboardList}
                isFetching={isFetching}
                toolbarRight={
                    <div className="field-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <input
                            className="field-input"
                            type="date"
                            value={range.startDate}
                            onChange={(e) => {
                                setPage(0);
                                setRange((p) => ({ ...p, startDate: e.target.value }));
                            }}
                            style={{ width: 160 }}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                        <input
                            className="field-input"
                            type="date"
                            value={range.endDate}
                            onChange={(e) => {
                                setPage(0);
                                setRange((p) => ({ ...p, endDate: e.target.value }));
                            }}
                            style={{ width: 160 }}
                        />
                    </div>
                }
                pagination={
                    meta
                        ? {
                              page,
                              totalPages: Math.max(1, meta.totalPages),
                              totalItems: meta.totalItems,
                              itemLabel: 'bản ghi',
                              onPageChange: setPage,
                              pageSize,
                              onPageSizeChange: (s) => { setPageSize(s); setPage(0); },
                          }
                        : null
                }
            >
                <table>
                    <thead>
                        <tr>
                            <th>Ngày</th>
                            <th>Giờ vào</th>
                            <th>Giờ ra</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 4 }).map((__, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    <div className="empty-state">
                                        <ClipboardList size={40} className="empty-icon" />
                                        <p className="empty-text">Không có dữ liệu chấm công</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, idx) => (
                                <tr key={row.id ?? idx}>
                                    <td className="td-primary">{formatDate(row.workDate)}</td>
                                    <td>{formatTime(row.checkInTime)}</td>
                                    <td>{formatTime(row.checkOutTime)}</td>
                                    <td><StatusBadge status={row.status} /></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </DataTable>
        </>
    );
}
