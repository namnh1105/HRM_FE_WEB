'use client';

import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import {
    useApproveLeaveRequestMutation,
    useCancelLeaveRequestMutation,
    useGetLeaveRequestsQuery,
    useGetPendingLeaveRequestsQuery,
} from '@/store/api/hrApi';
import ResourceTable, { extractRowsAndMeta, type ColumnDef } from '@/components/ResourceTable';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import DataTable from '@/components/ui/DataTable';
import { FilterPills, SearchBox } from '@/components/ui/ToolbarControls';

type Row = Record<string, unknown>;
type ListMode = 'all' | 'pending';

function rowStringId(row: Row): string | null {
    const id = row.id;
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
    return null;
}

function isPendingRow(row: Row): boolean {
    const s = String(row.status ?? '').toUpperCase();
    return s.includes('PENDING') || s.includes('CHỜ') || s === 'WAITING';
}

export default function LeaveRequestsResourceView() {
    const [page, setPage] = useState(0);
    const [listMode, setListMode] = useState<ListMode>('all');
    const size = 10;

    const allQuery = useGetLeaveRequestsQuery({ page, size }, { skip: listMode !== 'all' });
    const pendingQuery = useGetPendingLeaveRequestsQuery({ page, size }, { skip: listMode !== 'pending' });

    const active = listMode === 'all' ? allQuery : pendingQuery;
    const { data, isLoading, isFetching } = active;
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);

    const [approve, { isLoading: isApproving }] = useApproveLeaveRequestMutation();
    const [cancel, { isLoading: isCancelling }] = useCancelLeaveRequestMutation();
    const [search, setSearch] = useState('');

    const columns: ColumnDef[] = useMemo(
        () => [
            { key: 'employeeName', label: 'Nhân viên' },
            { key: 'type', label: 'Loại nghỉ' },
            { key: 'startDate', label: 'Từ ngày' },
            { key: 'endDate', label: 'Đến ngày' },
            { key: 'reason', label: 'Lý do' },
            { key: 'status', label: 'Trạng thái' },
        ],
        []
    );

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const pendingCount = list.filter(isPendingRow).length;
        let out = list;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter(
                (r) =>
                    String(r.employeeName ?? '')
                        .toLowerCase()
                        .includes(q) ||
                    String(r.reason ?? '')
                        .toLowerCase()
                        .includes(q)
            );
        }
        return { filtered: out, stats: { pending: pendingCount, total: list.length } };
    }, [rows, search]);

    return (
        <>
            <PageHeader
                title="Nghỉ phép"
                subtitle="Xem danh sách đơn nghỉ phép và duyệt đơn chờ xử lý."
            />

            <StatCards
                items={[
                    {
                        label: listMode === 'pending' ? 'Chờ duyệt (trang)' : 'Đơn chờ xử lý (ước lượng)',
                        value: isLoading ? '—' : listMode === 'pending' ? stats.total : stats.pending,
                        tone: 'amber',
                    },
                    { label: 'Tổng đơn trên trang', value: isLoading ? '—' : stats.total },
                ]}
            />

            <DataTable
                title="Danh sách đơn nghỉ phép"
                titleIcon={Calendar}
                isFetching={isFetching}
                toolbarRight={
                    <>
                        <FilterPills<ListMode>
                            options={[
                                { id: 'all', label: 'Tất cả đơn' },
                                { id: 'pending', label: 'Chờ duyệt' },
                            ]}
                            value={listMode}
                            onChange={(v) => {
                                setListMode(v);
                                setPage(0);
                            }}
                        />
                        <SearchBox
                            placeholder="Tìm nhân viên, lý do…"
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
                        actions={(row) => {
                            const id = rowStringId(row);
                            const canAct = id && (listMode === 'pending' || isPendingRow(row));
                            return (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        type="button"
                                        disabled={!canAct || isApproving || isCancelling}
                                        onClick={() => id && approve(id).unwrap().catch(() => {})}
                                        title="Duyệt"
                                    >
                                        <CheckCircle2 size={14} /> Duyệt
                                    </button>
                                    <button
                                        className="btn btn-sm btn-ghost"
                                        type="button"
                                        disabled={!canAct || isApproving || isCancelling}
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
            </DataTable>
        </>
    );
}
