import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal, 
  LayoutList, 
  LayoutGrid, 
  Network,
  Upload, 
  Download,
  Plus
} from 'lucide-react';
import styles from './DataTableToolbar.module.css';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
  isFilterActive?: boolean;
  onSortClick?: () => void;
  onColumnsClick?: () => void;
  viewMode?: string;
  onViewModeChange?: (mode: any) => void;
  onImportClick?: () => void;
  onExportClick?: () => void;
  primaryActionLabel?: string;
  onPrimaryActionClick?: () => void;
  primaryActionIcon?: React.ReactNode;
  extraFilters?: React.ReactNode;
  children?: React.ReactNode;
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilterClick,
  isFilterActive = false,
  onSortClick,
  onColumnsClick,
  viewMode = 'list',
  onViewModeChange,
  onImportClick,
  onExportClick,
  primaryActionLabel,
  onPrimaryActionClick,
  primaryActionIcon = <Plus size={15} strokeWidth={2.5} />,
  extraFilters,
  children
}) => {
  return (
    <div className={styles.toolbar}>
      {/* Left side: Search and quick utility triggers */}
      <div className={styles.left}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={styles.searchInput}
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={styles.clearBtn}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className={`${styles.iconBtn} ${isFilterActive ? styles.activeFilter : ''}`}
            title="Filter"
            aria-label="Filter"
          >
            <Filter size={15} />
          </button>
        )}

        {onSortClick && (
          <button
            type="button"
            onClick={onSortClick}
            className={styles.iconBtn}
            title="Sort"
            aria-label="Sort"
          >
            <ArrowUpDown size={15} />
          </button>
        )}

        {onColumnsClick && (
          <button
            type="button"
            onClick={onColumnsClick}
            className={styles.iconBtn}
            title="Customize columns"
            aria-label="Customize columns"
          >
            <SlidersHorizontal size={15} />
          </button>
        )}

        {/* Optional inline custom filter selects (e.g. Session/Branch) */}
        {extraFilters && <div className={styles.extraFilters}>{extraFilters}</div>}
      </div>

      {/* Right side: View switch, Import/Export, and Primary CTA */}
      <div className={styles.right}>
        {onViewModeChange && (
          <div className={styles.viewSwitcher}>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
              title="List View"
            >
              <LayoutList size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('tree')}
              className={`${styles.viewBtn} ${viewMode === 'tree' ? styles.viewBtnActive : ''}`}
              title="Hierarchy Canvas View"
            >
              <Network size={15} />
            </button>
          </div>
        )}

        {onImportClick && (
          <button
            type="button"
            onClick={onImportClick}
            className={styles.secondaryBtn}
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
        )}

        {onExportClick && (
          <button
            type="button"
            onClick={onExportClick}
            className={styles.secondaryBtn}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        )}

        {primaryActionLabel && onPrimaryActionClick && (
          <button
            type="button"
            onClick={onPrimaryActionClick}
            className={styles.primaryBtn}
          >
            {primaryActionIcon}
            <span>{primaryActionLabel}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
};
