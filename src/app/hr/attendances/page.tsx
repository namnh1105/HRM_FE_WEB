'use client';

import React, { useMemo, useState } from 'react';
import { LogIn, LogOut, Search } from 'lucide-react';
import { useCheckInMutation, useCheckOutMutation, useGetMyAttendanceHistoryQuery } from '@/store/api/hrApi';
import ResourceTable, { extractRowsAndMeta, type ColumnDef } from '@/components/ResourceTable';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';

export default function AttendancesPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    const [range, setRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
    const { data, isLoading, isFetching } = useGetMyAttendanceHistoryQuery({ ...range, page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [checkIn, { isLoading: isCheckIn }] = useCheckInMutation();
    const [checkOut, { isLoading: isCheckOut }] = useCheckOutMutation();

    const columns: ColumnDef[] = useMemo(
        () => [
            { key: 'workDate', label: 'Ngày' },
            { key: 'checkInTime', label: 'Giờ vào' },
            { key: 'checkOutTime', label: 'Giờ ra' },
            { key: 'status', label: 'Trạng thái' },
        ],
        []
    );

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
                titleIcon={Search}
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
                          }
                        : null
                }
            >
                <div style={{ padding: 16 }}>
                    <ResourceTable rows={rows} loading={isLoading} columns={columns} />
                </div>
            </DataTable>
        </>
    );
}
