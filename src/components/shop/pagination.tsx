
'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationComponentProps) {

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= half + 1) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - half) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - (maxPagesToShow - 2); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(1); }} isActive={currentPage === 1}>
                <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }} />
        </PaginationItem>
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === 'number' ? (
              <PaginationLink
                href="#"
                onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onPageChange(currentPage + 1); }} />
        </PaginationItem>
        <PaginationItem>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(totalPages); }} isActive={currentPage === totalPages}>
                <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
