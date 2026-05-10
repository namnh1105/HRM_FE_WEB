'use client';

import React, { useMemo, useState } from 'react';
import { FileText, Pencil, Plus, X } from 'lucide-react';
import { useCreateContractMutation, useGetContractsQuery, useUpdateContractMutation, useGetContractStatsQuery } from '@/store/api/hrApi';
import PageHeader from '@/components/ui/PageHeader';
import StatCards from '@/components/ui/StatCards';
import DataTable from '@/components/ui/DataTable';
import { FilterPills, SearchBox } from '@/components/ui/ToolbarControls';
import { useToast } from '@/hooks/useToast';
import ToastStack from '@/components/ToastStack';

type ContractRow = {
    id: string;
    code: string;
    employeeName?: string;
    employee?: { id?: string; fullName?: string };
    type?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    [key: string]: any;
};

function formatDate(val: string | undefined) {
    if (!val) return '—';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString('vi-VN');
}

function StatusBadge({ status }: { status?: string }) {
    const s = (status ?? '').toUpperCase();
    if (s.includes('ACTIVE')) return <span className="badge badge-green">Hiệu lực</span>;
    if (s.includes('EXPIRED') || s.includes('ENDED')) return <span className="badge badge-red">Hết hạn</span>;
    if (s.includes('PENDING')) return <span className="badge badge-amber">Chờ duyệt</span>;
    return <span className="badge badge-gray">{status || '—'}</span>;
}

export default function ContractsPage() {
    const { toasts, push: pushToast } = useToast();
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const { data, isLoading, isFetching, refetch } = useGetContractsQuery({ page, size: pageSize });
    
    // Fetch stats
    const { data: statsData } = useGetContractStatsQuery();
    const stats: any = (statsData as any)?.data;
    
    const contracts = (data as any)?.data ?? [];
    const meta = (data as any)?.pagination;

    const [formModal, setFormModal] = useState<{ open: boolean; contract?: ContractRow }>({ open: false });

    const filtered = useMemo(() => {
        let list = [...contracts];
        const q = search.toLowerCase();
        if (q) {
            list = list.filter(r => 
                r.code?.toLowerCase().includes(q) || 
                r.employeeName?.toLowerCase().includes(q)
            );
        }
        if (filter === 'active') list = list.filter(r => String(r.status || '').toUpperCase().includes('ACTIVE'));
        if (filter === 'inactive') list = list.filter(r => !String(r.status || '').toUpperCase().includes('ACTIVE'));
        return list;
    }, [contracts, search, filter]);

    return (
        <>
            <PageHeader
                title="Hợp đồng lao động"
                subtitle="Quản lý danh sách hợp đồng và trạng thái hiệu lực"
                actions={
                    <button type="button" className="btn btn-primary" onClick={() => setFormModal({ open: true })}>
                        <Plus size={15} /> Thêm hợp đồng
                    </button>
                }
            />

            <StatCards
                items={[
                    { label: 'Tổng hợp đồng', value: stats?.total ?? '—' },
                    { label: 'Đang hiệu lực', value: stats?.active ?? '—', tone: 'green' },
                    { label: 'Sắp hết hạn', value: stats?.inactive ?? '—', tone: 'amber' },
                    { label: 'Đã thanh lý', value: stats?.deleted ?? '—', tone: 'red' },
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
                                { id: 'inactive', label: 'Hết hạn/Khác' },
                            ]}
                            value={filter}
                            onChange={(v) => { setFilter(v); setPage(0); }}
                        />
                        <SearchBox
                            placeholder="Tìm mã HĐ, tên..."
                            value={search}
                            onChange={(v) => { setSearch(v); setPage(0); }}
                        />
                    </>
                }
                pagination={
                    meta ? {
                        page,
                        totalPages: meta.totalPages,
                        totalItems: meta.totalItems,
                        itemLabel: 'hợp đồng',
                        onPageChange: setPage,
                        pageSize,
                        onPageSizeChange: (s) => { setPageSize(s); setPage(0); }
                    } : null
                }
            >
                <table>
                    <thead>
                        <tr>
                            <th>Mã HĐ</th>
                            <th>Nhân viên</th>
                            <th>Loại</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    {Array.from({ length: 7 }).map((__, j) => (
                                        <td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>
                                    ))}
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state">
                                        <FileText size={40} className="empty-icon" />
                                        <p className="empty-text">Không tìm thấy hợp đồng nào</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <code style={{ fontSize: 12, color: 'var(--accent-light)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: 4 }}>
                                            {row.code}
                                        </code>
                                    </td>
                                    <td className="td-primary">{row.employeeName || row.employee?.fullName || '—'}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{row.type}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(row.startDate)}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(row.endDate)}</td>
                                    <td><StatusBadge status={row.status} /></td>
                                    <td>
                                        <button className="btn btn-sm btn-primary" onClick={() => setFormModal({ open: true, contract: row })}>
                                            <Pencil size={14} /> Sửa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </DataTable>

            {formModal.open && (
                <ContractFormModal 
                    initial={formModal.contract} 
                    onClose={() => setFormModal({ open: false })} 
                    onSaved={refetch}
                    pushToast={pushToast}
                />
            )}

            <ToastStack toasts={toasts} />
        </>
    );
}

function ContractFormModal({ initial, onClose, onSaved, pushToast }: any) {
    const [create] = useCreateContractMutation();
    const [update] = useUpdateContractMutation();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        code: initial?.code || '',
        employeeId: initial?.employeeId || initial?.employee?.id || '',
        type: initial?.type || 'FULL_TIME',
        startDate: initial?.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        endDate: initial?.endDate?.slice(0, 10) || '',
        status: initial?.status || 'ACTIVE'
    });

    const handleSubmit = async () => {
        if (!formData.code || (!initial && !formData.employeeId)) return pushToast('Vui lòng điền đủ thông tin', 'error');
        setLoading(true);
        try {
            if (initial?.id) {
                await update({ id: initial.id, body: formData }).unwrap();
                pushToast('Cập nhật thành công');
            } else {
                await create(formData).unwrap();
                pushToast('Thêm mới thành công');
            }
            onSaved();
            onClose();
        } catch {
            pushToast('Thao tác thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <p className="modal-title">{initial ? 'Sửa hợp đồng' : 'Thêm hợp đồng'}</p>
                    <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="modal-body">
                    <div className="field-group">
                        <label className="field-label">Mã hợp đồng</label>
                        <input className="field-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                    </div>
                    {!initial && (
                        <div className="field-group">
                            <label className="field-label">ID Nhân viên (UUID)</label>
                            <input className="field-input" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} placeholder="Nhập UUID nhân viên" />
                        </div>
                    )}
                    <div className="field-group">
                        <label className="field-label">Loại hợp đồng</label>
                        <input className="field-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Từ ngày</label>
                        <input className="field-input" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Đến ngày (Tùy chọn)</label>
                        <input className="field-input" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                    <div className="field-group">
                        <label className="field-label">Trạng thái</label>
                        <input className="field-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>Lưu</button>
                </div>
            </div>
        </div>
    );
}
