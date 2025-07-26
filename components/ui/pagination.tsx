
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  buttonSize?: "sm" | "default" | "lg";
  buttonVariant?: "default" | "outline" | "ghost" | "ghost_bg";
  showFirstLast?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
  showPrevNext?: boolean;
  customWidth?: string;
  customHeight?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  buttonSize = "sm",
  buttonVariant = "ghost_bg",
  showFirstLast = true,
  maxVisiblePages = 5,
  disabled = false,
  showPrevNext = true,
  customWidth,
  customHeight,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  // Calculate button dimensions
  const buttonClass = cn(
    customWidth && customHeight
      ? ""
      : buttonSize === "sm"
      ? "w-10 h-10"
      : buttonSize === "lg"
      ? "w-12 h-12"
      : "w-11 h-11",
    customWidth && `w-[${customWidth}]`,
    customHeight && `h-[${customHeight}]`,
    disabled && "opacity-50 cursor-not-allowed"
  );

  const prevNextButtonClass = cn(
    customHeight && `h-[${customHeight}]`,
    disabled && "opacity-50 cursor-not-allowed"
  );

  // Generate page numbers to display
  const getVisiblePages = () => {
    const visiblePages: (number | "ellipsis")[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Always show first page
      if (showFirstLast) {
        visiblePages.push(1);
      }

      // Calculate start and end of visible range
      let start = Math.max(
        showFirstLast ? 2 : 1,
        currentPage - halfVisible
      );
      let end = Math.min(
        showFirstLast ? totalPages - 1 : totalPages,
        currentPage + halfVisible
      );

      // Adjust range if at the beginning or end
      if (currentPage <= halfVisible + (showFirstLast ? 1 : 0)) {
        start = showFirstLast ? 2 : 1;
        end = Math.min(totalPages - (showFirstLast ? 1 : 0), maxVisiblePages - (showFirstLast ? 1 : 0));
      } else if (currentPage >= totalPages - halfVisible - (showFirstLast ? 0 : 0)) {
        start = Math.max(
          showFirstLast ? 2 : 1,
          totalPages - maxVisiblePages + (showFirstLast ? 2 : 1)
        );
        end = showFirstLast ? totalPages - 1 : totalPages;
      }

      // Add ellipsis before visible range if needed
      if (start > (showFirstLast ? 2 : 1)) {
        if (start > (showFirstLast ? 3 : 2)) {
          visiblePages.push("ellipsis");
        }
      }

      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      // Add ellipsis after visible range if needed
      if (end < (showFirstLast ? totalPages - 1 : totalPages)) {
        if (end < (showFirstLast ? totalPages - 2 : totalPages - 1)) {
          visiblePages.push("ellipsis");
        }
      }

      // Always show last page
      if (showFirstLast && totalPages > 1) {
        visiblePages.push(totalPages);
      }
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Previous Button */}
      {showPrevNext && (
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={cn("flex items-center gap-2", prevNextButtonClass)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {visiblePages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-gray-500 dark:text-gray-400 px-2"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : buttonVariant}
              size={buttonSize}
              onClick={() => handlePageChange(page)}
              disabled={disabled}
              className={buttonClass}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* Next Button */}
      {showPrevNext && (
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={cn("flex items-center gap-2", prevNextButtonClass)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
