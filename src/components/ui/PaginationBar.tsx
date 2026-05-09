'use client';

import React from 'react';
import TablePagination from '@/components/ui/TablePagination';

/** @deprecated Dùng `TablePagination` hoặc `DataTable` — giữ lại để tương thích gọi cũ. */
export default function PaginationBar({
    page,
    totalPages,
    totalItems,
    itemLabel,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    totalItems: number;
    itemLabel: string;
    onPageChange: (nextPage: number) => void;
}) {
    return (
        <TablePagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemLabel={itemLabel}
            onPageChange={onPageChange}
            siblingCount={1}
        />
    );
}
