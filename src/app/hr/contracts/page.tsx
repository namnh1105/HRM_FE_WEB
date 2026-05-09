'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react';
import { useGetContractsQuery } from '@/store/api/hrApi';
import HrResourceTable, { extractRowsAndMeta, type HrColumnDef } from '@/components/HrResourceTable';

export default function ContractsPage() {
    const [page, setPage] = useState(0);
    const size = 10;
    const { data, isLoading, isFetching } = useGetContractsQuery({ page, size });
    const { rows, meta } = useMemo(() => extractRowsAndMeta(data), [data]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const columns: HrColumnDef[] = useMemo(() => ([
        { key: 'code', label: 'Mã HĐ' },
        { key: 'employeeName', label: 'Nhân viên' },
        { key: 'type', label: 'Loại' },
        { key: 'startDate', label: 'Từ ngày' },
        { key: 'endDate', label: 'Đến ngày' },
        { key: 'status', label: 'Trạng thái' },
    ]), []);

    const { filtered, stats } = useMemo(() => {
        const list = rows;
        const isActive = (r: Record<string, unknown>) => String(r.status ?? '').toUpperCase().includes('ACTIVE');
        const activeCount = list.filter(isActive).length;
        const inactiveCount = list.length - activeCount;
        let out = list;
        if (filter === 'active') out = out.filter(isActive);
        if (filter === 'inactive') out = out.filter((r) => !isActive(r));
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter((r) =>
                String(r.code ?? '').toLowerCase().includes(q) ||
                String(r.employeeName ?? '').toLowerCase().includes(q)
            );
        }
        return { filtered: out, stats: { total: list.length, active: activeCount, inactive: inactiveCount } };
    }, [rows, filter, search]);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hợp đồng</h1>
                    <p className="page-subtitle">Theo dõi hợp đồng theo trạng thái và tìm kiếm nhanh.</p>
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <p className="stat-label">Tổng hợp đồng</p>
                    <p className="stat-value">{isLoading ? '—' : stats.total}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Đang hiệu lực</p>
                    <p className="stat-value" style={{ color: 'var(--green)' }}>{isLoading ? '—' : stats.active}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Không hiệu lực</p>
                    <p className="stat-value" style={{ color: 'var(--amber)' }}>{isLoading ? '—' : stats.inactive}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Ghi chú</p>
                    <p className="stat-sub">Ẩn các trường ID kỹ thuật trong bảng</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="toolbar-left">
                        <p className="table-title">
                            <FileText size={16} style={{ display: 'inline', marginRight: 6 }} />
                            Danh sách hợp đồng
                            {isFetching && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Đang tải...</span>}
                        </p>
                    </div>
                    <div className="toolbar-right">
                        {(['all', 'active', 'inactive'] as const).map((f) => (
                            <button
                                key={f}
                                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                                type="button"
                                onClick={() => { setFilter(f); setPage(0); }}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'active' ? 'Hiệu lực' : 'Không HL'}
                            </button>
                        ))}
                        <div className="toolbar-search">
                            <Search size={14} className="toolbar-search-icon" />
                            <input
                                className="toolbar-search-input"
                                placeholder="Tìm mã HĐ, nhân viên…"
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
                        actions={() => (
                            <button className="btn btn-sm btn-ghost" type="button" disabled title="Chờ màn chi tiết">
                                <FileText size={14} /> Xem
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
