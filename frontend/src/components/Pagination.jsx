import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, size, total, onPageChange }) {
  const maxPage = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <button className="icon-button" title="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft size={18} />
      </button>
      <span>
        Page {page} of {maxPage}
      </span>
      <button className="icon-button" title="Next page" disabled={page >= maxPage} onClick={() => onPageChange(page + 1)}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
