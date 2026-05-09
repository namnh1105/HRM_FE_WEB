'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck2, Search, Clock3 } from 'lucide-react';
import { useGetWorkShiftsQuery } from '@/store/api/hrApi';
import HrResourceTable, { extractRowsAndMeta, type HrColumnDef } from '@/components/HrResourceTable';

export default function WorkShiftsPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching } = useGetWorkShiftsQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

    const columns: HrColumnDef[] = useMemo(() => ([
        { key: 'name', label: 'Tên ca' },
        { key: 'startTime', label: 'Giờ vào' },
        { key: 'endTime', label: 'Giờ ra' },
        { key: 'enabled', label: 'Kích hoạt' },
        { key: 'createdAt', label: 'Ngày tạo' },
    ]), []);

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const isEnabled = (r: Record<string, unknown>) => {
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

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ca làm</h1>
                    <p className="page-subtitle">Danh sách ca làm, lọc theo trạng thái kích hoạt.</p>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Tổng ca</p>
                    <p className="stat-value">{isLoading ? '—' : stats.total}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đang bật</p>
                    <p className="stat-value" style={{ color: 'var(--green)' }}>{isLoading ? '—' : stats.enabled}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đang tắt</p>
                    <p className="stat-value" style={{ color: 'var(--amber)' }}>{isLoading ? '—' : stats.disabled}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Ghi chú</p>
                    <p className="stat-sub">Hành động CRUD sẽ bổ sung theo API chi tiết</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <Clock3 size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Danh sách ca làm
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        {(['all', 'enabled', 'disabled'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                type="button"
                                onClick={() => { setFilter(f); setPage(0); }}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'enabled' ? 'Đang bật' : 'Đang tắt'}
                            </button>
                        ))}
                        <div className="toolbar-search">
                            <Search size={14} className="toolbar-search-icon" />
                            <input
                                className="toolbar-search-input"
                                placeholder="Tìm tên ca…"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            />
                        </div>
                        <span className="page-info">
                            {meta ? `Trang ${meta.page + 1}/${meta.totalPages} - ${meta.totalItems} bản ghi` : `${filtered.length} bản ghi`}
                        </span>
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    <HrResourceTable
                        rows={filtered}
                        loading={isLoading}
                        columns={columns}
                        actions={() => (
                            <button className="btn btn-sm btn-ghost" type="button" disabled title="Chờ hành động">
                                <CalendarCheck2 size={14} /> Chi tiết
                            </button>
                        )}
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
