'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    page,
    totalPages,
    onPrev,
    onNext,
}: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="pagination">
            <button className="page-btn" disabled={page === 0} onClick={onPrev} type="button">
                <ChevronLeft size={15} />
            </button>
            <button className="page-btn" disabled={page >= totalPages - 1} onClick={onNext} type="button">
                <ChevronRight size={15} />
            </button>
        </div>
    );
}
