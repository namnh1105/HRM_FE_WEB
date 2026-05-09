'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getPaginationItems } from '@/utils/pagination';

export type TablePaginationProps = {
    /** Trang hiện tại, 0-based */
    page: number;
    totalPages: number;
    totalItems: number;
    itemLabel: string;
    onPageChange: (nextPage: number) => void;
    /** Ẩn dòng “Trang x / y — z …” */
    hideInfo?: boolean;
    siblingCount?: number;
    className?: string;
};

export default function TablePagination({
    page,
    totalPages,
    totalItems,
    itemLabel,
    onPageChange,
    hideInfo = false,
    siblingCount = 1,
    className,
}: TablePaginationProps) {
    if (totalPages < 1) return null;

    const items = getPaginationItems(page, totalPages, siblingCount);
    const last = totalPages - 1;

    return (
        <div className={`table-pagination-row${className ? ` ${className}` : ''}`}>
            {!hideInfo ? (
                <span className="table-pagination-info">
                    Trang {page + 1} / {totalPages} — {totalItems} {itemLabel}
                </span>
            ) : (
                <span />
            )}
            <div className="table-pagination-nav" role="navigation" aria-label="Phân trang">
                <button
                    type="button"
                    className="table-pagination-btn"
                    disabled={page <= 0}
                    onClick={() => onPageChange(0)}
                    aria-label="Trang đầu"
                >
                    <ChevronsLeft size={16} strokeWidth={2} />
                </button>
                <button
                    type="button"
                    className="table-pagination-btn"
                    disabled={page <= 0}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Trang trước"
                >
                    <ChevronLeft size={16} strokeWidth={2} />
                </button>
                {items.map((item, idx) =>
                    item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="table-pagination-ellipsis" aria-hidden>
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className={`table-pagination-btn table-pagination-btn--num${item === page ? ' is-active' : ''}`}
                            onClick={() => onPageChange(item)}
                            aria-label={`Trang ${item + 1}`}
                            aria-current={item === page ? 'page' : undefined}
                        >
                            {item + 1}
                        </button>
                    )
                )}
                <button
                    type="button"
                    className="table-pagination-btn"
                    disabled={page >= last}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Trang sau"
                >
                    <ChevronRight size={16} strokeWidth={2} />
                </button>
                <button
                    type="button"
                    className="table-pagination-btn"
                    disabled={page >= last}
                    onClick={() => onPageChange(last)}
                    aria-label="Trang cuối"
                >
                    <ChevronsRight size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
