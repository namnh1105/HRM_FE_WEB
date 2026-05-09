'use client';

import React from 'react';

type Row = Record<string, unknown>;
type PaginationMeta = { page: number; totalPages: number; totalItems: number };

export type HrColumnDef<T extends Row = Row> = {
    key: string;
    label: string;
    render?: (row: T) => React.ReactNode;
};

const asObject = (value: unknown): Record<string, unknown> | null =>
    typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

export const extractRowsAndMeta = (response: unknown): { rows: Row[]; meta: PaginationMeta | null } => {
    const root = asObject(response);
    if (!root) return { rows: [], meta: null };

    const pagination = asObject(root.pagination);
    const data = root.data;
    const rows = Array.isArray(data) ? data.filter((item): item is Row => !!asObject(item)) : [];

    if (!pagination) return { rows, meta: null };

    const page = typeof pagination.page === 'number' ? pagination.page : 0;
    const totalPages = typeof pagination.totalPages === 'number' ? pagination.totalPages : 0;
    const totalItems = typeof pagination.totalItems === 'number' ? pagination.totalItems : rows.length;

    return { rows, meta: { page, totalPages, totalItems } };
};

const formatCell = (value: unknown): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value instanceof Date) return value.toLocaleString('vi-VN');
    if (typeof value === 'string') {
        const maybeDate = new Date(value);
        if (!Number.isNaN(maybeDate.getTime()) && /\d{4}-\d{2}-\d{2}T/.test(value)) {
            return maybeDate.toLocaleString('vi-VN');
        }
    }
    return JSON.stringify(value);
};

const DEFAULT_LABELS: Record<string, string> = {
    fullName: 'Họ và tên',
    email: 'Email',
    employmentStatus: 'Trạng thái',
    status: 'Trạng thái',
    startDate: 'Từ ngày',
    endDate: 'Đến ngày',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
    firstName: 'Tên',
    lastName: 'Họ',
    code: 'Mã',
    name: 'Tên',
    title: 'Tiêu đề',
    type: 'Loại',
    reason: 'Lý do',
};

const isTechnicalIdKey = (key: string) => {
    const k = key.toLowerCase();
    return k === 'id' || k.endsWith('id') || k.includes('uuid') || k.includes('createdby') || k.includes('updatedby');
};

export default function HrResourceTable({
    rows,
    loading,
    columns,
    actions,
}: {
    rows: Row[];
    loading: boolean;
    columns?: HrColumnDef[];
    actions?: (row: Row) => React.ReactNode;
}) {
    const autoColumns = rows.length > 0
        ? Object.keys(rows[0]).filter((k) => !isTechnicalIdKey(k)).slice(0, 6)
        : [];
    const resolvedColumns: HrColumnDef[] = columns && columns.length
        ? columns
        : autoColumns.map((key) => ({ key, label: DEFAULT_LABELS[key] ?? key }));

    if (loading) {
        return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang tải dữ liệu...</p>;
    }

    if (rows.length === 0) {
        return <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Không có dữ liệu.</p>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table>
                <thead>
                    <tr>
                        {resolvedColumns.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                        {actions && <th>Hành động</th>}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => (
                        <tr key={String(row.id ?? idx)}>
                            {resolvedColumns.map((column) => (
                                <td key={`${idx}-${column.key}`}>
                                    {column.render ? column.render(row) : formatCell(row[column.key])}
                                </td>
                            ))}
                            {actions && <td>{actions(row)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
