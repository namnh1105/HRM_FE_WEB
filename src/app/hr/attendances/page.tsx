'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import {
    useGetAttendancesByStoreHistoryQuery,
    useGetAttendanceHistoryByEmployeeQuery,
    useGetEmployeesByStoreQuery,
    useGetStoresQuery,
} from '@/store/api/hrApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';

type AttendanceRow = {
    id?: string;
    employeeName?: string;
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
    const { data: storesData } = useGetStoresQuery();
    const stores = (storesData as any)?.data ?? [];
    const [storeId, setStoreId] = useState<string>('');
    const [employeeId, setEmployeeId] = useState<string>('');

    useEffect(() => {
        if (!storeId && stores.length > 0) {
            setStoreId(stores[0].id);
        }
    }, [stores, storeId]);

    useEffect(() => {
        setEmployeeId('');
        setPage(0);
    }, [storeId]);

    useEffect(() => {
        if (!range.startDate || !range.endDate) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 30);
            setRange({
                startDate: start.toISOString().slice(0, 10),
                endDate: end.toISOString().slice(0, 10),
            });
        }
    }, [range.endDate, range.startDate]);

    const { data: employeesData } = useGetEmployeesByStoreQuery(
        { storeId, page: 0, size: 200 },
        { skip: !storeId }
    );
    const employees = (employeesData as any)?.data ?? [];

    const { data: storeAttendanceData, isLoading: storeLoading, isFetching: storeFetching } = useGetAttendancesByStoreHistoryQuery(
        { storeId, startDate: range.startDate, endDate: range.endDate, page, size: pageSize },
        { skip: !storeId || !range.startDate || !range.endDate || !!employeeId }
    );

    const { data: employeeAttendanceData, isLoading: employeeLoading, isFetching: employeeFetching } = useGetAttendanceHistoryByEmployeeQuery(
        { employeeId, startDate: range.startDate, endDate: range.endDate, page, size: pageSize },
        { skip: !employeeId || !range.startDate || !range.endDate }
    );

    const activeData = employeeId ? employeeAttendanceData : storeAttendanceData;
    const rows: AttendanceRow[] = (activeData as any)?.data ?? [];
    const meta = (activeData as any)?.pagination;
    const isLoading = employeeId ? employeeLoading : storeLoading;
    const isFetching = employeeId ? employeeFetching : storeFetching;

    return (
        <>
            <PageHeader
                title="Chấm công"
                subtitle="Theo dõi lịch sử chấm công toàn chi nhánh."
            />

            <DataTable
                title="Lịch sử chấm công"
                titleIcon={ClipboardList}
                isFetching={isFetching}
                toolbarRight={
                    <div className="field-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <select
                            className="field-input"
                            value={storeId}
                            onChange={(e) => {
                                setPage(0);
                                setStoreId(e.target.value);
                            }}
                            style={{ minWidth: 180 }}
                        >
                            {stores.length === 0 && <option value="">Chưa có chi nhánh</option>}
                            {stores.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <select
                            className="field-input"
                            value={employeeId}
                            onChange={(e) => {
                                setPage(0);
                                setEmployeeId(e.target.value);
                            }}
                            style={{ minWidth: 200 }}
                            disabled={!storeId}
                        >
                            <option value="">Tất cả nhân viên</option>
                            {employees.map((emp: any) => (
                                <option key={emp.id} value={emp.id}>{emp.fullName || emp.email}</option>
                            ))}
                        </select>
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
                            <th>Nhân viên</th>
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
                                    {Array.from({ length: 5 }).map((__, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="empty-state">
                                        <ClipboardList size={40} className="empty-icon" />
                                        <p className="empty-text">Không có dữ liệu chấm công</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, idx) => (
                                <tr key={row.id ?? idx}>
                                    <td className="td-primary">{row.employeeName ?? '—'}</td>
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
