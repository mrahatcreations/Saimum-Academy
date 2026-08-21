import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  Building2, 
  LibraryBig, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Mail, 
  Calendar, 
  Printer, 
  ShieldCheck,
  User
} from 'lucide-react';
import type { StaffItem } from '../../services/staffService';
import type { BranchItem, DepartmentItem } from '../../services/academicService';
import type { BatchItem } from '../../services/batchService';
import { UserAvatar } from '../ui/UserAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './OrgHierarchyCanvas.module.css';

interface OrgHierarchyCanvasProps {
  staffList: StaffItem[];
  branches: BranchItem[];
  departments: DepartmentItem[];
  batches: BatchItem[];
  onEditStaff?: (staff: StaffItem) => void;
}

interface WireLine {
  id: string;
  d: string;
  isActive?: boolean;
}

export const OrgHierarchyCanvas: React.FC<OrgHierarchyCanvasProps> = ({
  staffList,
  branches,
  departments,
  batches,
  onEditStaff
}) => {
  // Canvas Transform State
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const transformContainerRef = useRef<HTMLDivElement>(null);

  // Wire lines calculated from DOM elements
  const [svgWires, setSvgWires] = useState<WireLine[]>([]);
  const hqRef = useRef<HTMLDivElement>(null);
  const branchRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Search Spotlight
  const [searchQuery, setSearchQuery] = useState('');

  // Expand / Collapse state for branch subtrees
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());

  // Selected Node Drawer
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null);

  // 1. Group Staff into Central HQ vs Branch-assigned
  const centralAdmins = useMemo(() => {
    return staffList.filter(s => s.role === 'SUPER_ADMIN' || !s.branchId);
  }, [staffList]);

  // Branch data with assigned staff and departments
  const branchesWithHierarchy = useMemo(() => {
    return branches.map(branch => {
      const branchStaff = staffList.filter(s => s.branchId === branch.id);
      const branchDepts = branch.departments?.map(d => d.department).filter(Boolean) || departments;

      const deptsWithDetails = branchDepts.map(dept => {
        const deptStaff = branchStaff.filter(s => 
          s.assignedDepartments?.some(ad => ad.departmentId === dept.id)
        );

        const deptBatches = batches.filter(b => 
          b.branchId === branch.id && (b.departmentId === dept.id || b.departmentName?.toLowerCase() === dept.name.toLowerCase())
        );

        return {
          ...dept,
          staff: deptStaff,
          batches: deptBatches
        };
      });

      return {
        ...branch,
        staff: branchStaff,
        departments: deptsWithDetails
      };
    });
  }, [branches, staffList, departments, batches]);

  // Calculate SVG Wire Paths between HQ and Branches
  const updateWires = useCallback(() => {
    if (!hqRef.current || !transformContainerRef.current) return;

    const containerRect = transformContainerRef.current.getBoundingClientRect();
    const hqRect = hqRef.current.getBoundingClientRect();

    // HQ Bottom Port relative to container
    const hqPortX = (hqRect.left + hqRect.width / 2 - containerRect.left) / scale;
    const hqPortY = (hqRect.bottom - containerRect.top) / scale;

    const lines: WireLine[] = [];
    const branchPoints: { x: number; y: number; id: string }[] = [];

    branchesWithHierarchy.forEach(branch => {
      const branchEl = branchRefs.current.get(branch.id);
      if (branchEl) {
        const bRect = branchEl.getBoundingClientRect();
        const bX = (bRect.left + bRect.width / 2 - containerRect.left) / scale;
        const bY = (bRect.top - containerRect.top) / scale;
        branchPoints.push({ x: bX, y: bY, id: branch.id });
      }
    });

    if (branchPoints.length > 0) {
      const busY = hqPortY + 35; // Horizontal bus bar Y

      // 1. Central vertical drop from HQ to Bus
      lines.push({
        id: 'hq-to-bus',
        d: `M ${hqPortX} ${hqPortY} L ${hqPortX} ${busY}`,
        isActive: true
      });

      // 2. Horizontal bus bar connecting left-most to right-most branch
      const minX = Math.min(...branchPoints.map(p => p.x), hqPortX);
      const maxX = Math.max(...branchPoints.map(p => p.x), hqPortX);
      lines.push({
        id: 'branch-bus-bar',
        d: `M ${minX} ${busY} L ${maxX} ${busY}`,
        isActive: true
      });

      // 3. Vertical drops from Bus Bar to each Branch Top Port
      branchPoints.forEach(p => {
        lines.push({
          id: `bus-to-${p.id}`,
          d: `M ${p.x} ${busY} L ${p.x} ${p.y}`,
          isActive: true
        });
      });
    }

    setSvgWires(lines);
  }, [branchesWithHierarchy, scale]);

  // Recalculate wires on layout change or zoom/collapse
  useEffect(() => {
    const timer = setTimeout(updateWires, 60);
    return () => clearTimeout(timer);
  }, [updateWires, collapsedBranches, scale]);

  useEffect(() => {
    window.addEventListener('resize', updateWires);
    return () => window.removeEventListener('resize', updateWires);
  }, [updateWires]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.hqStaffRow}`) ||
        (e.target as HTMLElement).closest(`.${styles.branchStaffRow}`) ||
        (e.target as HTMLElement).closest(`.${styles.deptFacultyItem}`) ||
        (e.target as HTMLElement).closest(`.${styles.toggleDeptBtn}`) ||
        (e.target as HTMLElement).closest(`.${styles.hudBtn}`) ||
        (e.target as HTMLElement).closest(`.${styles.drawerOverlay}`)) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoom = () => {
    setScale(0.85);
    setPan({ x: 0, y: 10 });
  };

  const handleFitToScreen = () => {
    setScale(0.75);
    setPan({ x: 0, y: 30 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.06 : -0.06;
    setScale(prev => Math.min(Math.max(prev + zoomFactor, 0.35), 2.0));
  };

  // Toggle Branch Collapse
  const toggleBranchCollapse = (branchId: string) => {
    setCollapsedBranches(prev => {
      const next = new Set(prev);
      if (next.has(branchId)) {
        next.delete(branchId);
      } else {
        next.add(branchId);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedBranches(new Set());
  const collapseAll = () => {
    setCollapsedBranches(new Set(branches.map(b => b.id)));
  };

  // Spotlight match helper
  const isMatch = (text?: string | null) => {
    if (!searchQuery || !text) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.canvasContainer}>
      {/* 1. Floating HUD Top Bar */}
      <div className={styles.hudBar}>
        {/* Left: Spotlight Search & Hierarchy Controls */}
        <div className={styles.hudGroup}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search admin, branch, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.hudDivider} />
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={expandAll}
            title="Expand All Branches"
          >
            <ChevronDown size={14} />
            <span>Expand All</span>
          </button>
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={collapseAll}
            title="Collapse All Branches"
          >
            <ChevronUp size={14} />
            <span>Collapse All</span>
          </button>
        </div>

        {/* Center: Graph Legend */}
        <div className={styles.hudGroup}>
          <div className={styles.legendPill}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#FF790E' }} />
              <span>Central HQ</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#2563EB' }} />
              <span>Branch Hub</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: '#10B981' }} />
              <span>Department</span>
            </div>
          </div>
        </div>

        {/* Right: Zoom & Export Controls */}
        <div className={styles.hudGroup}>
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className={styles.zoomValue}>{Math.round(scale * 100)}%</span>
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <div className={styles.hudDivider} />
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={handleFitToScreen}
            title="Fit to Screen"
          >
            <Maximize2 size={14} />
            <span>Fit</span>
          </button>
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={handleResetZoom}
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
          <div className={styles.hudDivider} />
          <button 
            type="button" 
            className={styles.hudBtn} 
            onClick={handlePrint}
            title="Print Blueprint"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Graph Viewport */}
      <div 
        ref={viewportRef}
        className={`${styles.graphViewport} ${isDragging ? styles.graphViewportDragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          ref={transformContainerRef}
          className={styles.panZoomLayer}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
          }}
        >
          {/* SVG Connection Wires Layer */}
          <svg className={styles.svgWireLayer}>
            <defs>
              <marker id="dotJunction" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
                <circle cx="5" cy="5" r="4" fill="#FF790E" stroke="#FFFFFF" strokeWidth="2" />
              </marker>
            </defs>
            {svgWires.map(wire => (
              <path 
                key={wire.id} 
                d={wire.d} 
                className={`${styles.wirePath} ${wire.isActive ? styles.wirePathActive : ''}`} 
              />
            ))}
          </svg>

          {/* Graph Nodes Layer */}
          <div className={styles.graphContentLayer}>
            {/* ================================================================= */}
            {/* LEVEL 1: CENTRAL HEADQUARTERS (HQ CORE)                           */}
            {/* ================================================================= */}
            <div 
              ref={hqRef}
              className={`${styles.hqNodeCard} ${isMatch('Central') || centralAdmins.some(a => isMatch(a.fullName) || isMatch(a.designation)) ? styles.highlightedNode : ''}`}
            >
              <div className={styles.hqCardTop}>
                <div className={styles.hqBrandGroup}>
                  <div className={styles.hqIconBox}>
                    <ShieldCheck size={22} />
                  </div>
                  <div className={styles.hqTitleMeta}>
                    <span className={styles.hqLevelTag}>LEVEL 01 • CENTRAL DIRECTIVITY</span>
                    <span className={styles.hqMainTitle}>Saimum Central Academy (HQ)</span>
                  </div>
                </div>
                <span className={styles.hqBadge}>Supreme Body</span>
              </div>

              {/* Central Leaders List */}
              <div className={styles.hqStaffList}>
                {centralAdmins.length > 0 ? (
                  centralAdmins.map(admin => (
                    <div 
                      key={admin.id}
                      className={`${styles.hqStaffRow} ${isMatch(admin.fullName) || isMatch(admin.designation) ? styles.highlightedNode : ''}`}
                      onClick={() => setSelectedStaff(admin)}
                      title="Click to view complete profile"
                    >
                      <div className={styles.staffLeft}>
                        <UserAvatar name={admin.fullName} size="md" />
                        <div className={styles.staffInfo}>
                          <span className={styles.staffName}>{admin.fullName}</span>
                          <span className={styles.staffDesig}>{admin.designation || 'Central Super Admin'}</span>
                        </div>
                      </div>
                      <StatusBadge status="Super Admin" variant="purple" />
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyText}>No central administrators registered</div>
                )}
              </div>

              {/* HQ Summary Metrics Strip */}
              <div className={styles.hqSummaryStrip}>
                <div className={styles.hqSummaryItem}>
                  <span className={styles.hqSummaryVal}>{branches.length}</span>
                  <span className={styles.hqSummaryLbl}>Branches</span>
                </div>
                <div className={styles.hqSummaryItem}>
                  <span className={styles.hqSummaryVal}>{departments.length}</span>
                  <span className={styles.hqSummaryLbl}>Departments</span>
                </div>
                <div className={styles.hqSummaryItem}>
                  <span className={styles.hqSummaryVal}>{staffList.length}</span>
                  <span className={styles.hqSummaryLbl}>Total Staff</span>
                </div>
                <div className={styles.hqSummaryItem}>
                  <span className={styles.hqSummaryVal}>{batches.length}</span>
                  <span className={styles.hqSummaryLbl}>Batches</span>
                </div>
              </div>

              {/* Bottom Wire Port Pin */}
              <div className={styles.nodePortBottom} />
            </div>

            {/* Gap for SVG Bus Wiring */}
            <div className={styles.verticalSpineGap} />

            {/* ================================================================= */}
            {/* LEVEL 2: BRANCH NODES (HORIZONTAL BUS ARRAY)                      */}
            {/* ================================================================= */}
            <div className={styles.branchesRow}>
              {branchesWithHierarchy.map((branch) => {
                const isCollapsed = collapsedBranches.has(branch.id);
                const isBranchMatched = isMatch(branch.name) || isMatch(branch.code) || 
                  branch.staff.some(s => isMatch(s.fullName) || isMatch(s.designation));

                return (
                  <div 
                    key={branch.id} 
                    className={styles.branchBlock}
                    ref={(el) => {
                      if (el) branchRefs.current.set(branch.id, el);
                      else branchRefs.current.delete(branch.id);
                    }}
                  >
                    {/* Branch Card */}
                    <div className={`${styles.branchCard} ${branch.type === 'ONLINE' ? styles.branchCardOnline : ''} ${isBranchMatched ? styles.highlightedNode : ''}`}>
                      {/* Top Wire Port Pin */}
                      <div className={styles.nodePortTop} />

                      <div className={styles.branchCardTop}>
                        <div className={styles.branchTitleGroup}>
                          <div className={styles.branchIconBox}>
                            <Building2 size={16} />
                          </div>
                          <span className={styles.branchName}>{branch.name}</span>
                        </div>
                        <span className={styles.branchCode}>{branch.code || 'BR'}</span>
                      </div>

                      {/* Branch Assigned Staff */}
                      <div className={styles.branchSectionLabel}>
                        <span>Branch In-Charge / Staff</span>
                        <span>{branch.staff.length}</span>
                      </div>

                      <div className={styles.branchStaffBox}>
                        {branch.staff.length > 0 ? (
                          branch.staff.map(staff => (
                            <div 
                              key={staff.id}
                              className={`${styles.branchStaffRow} ${isMatch(staff.fullName) || isMatch(staff.designation) ? styles.highlightedNode : ''}`}
                              onClick={() => setSelectedStaff(staff)}
                              title="Click to view staff details"
                            >
                              <UserAvatar name={staff.fullName} size="sm" />
                              <div className={styles.staffInfo}>
                                <span className={styles.staffName}>{staff.fullName}</span>
                                <span className={styles.staffDesig}>{staff.designation || staff.role}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className={styles.emptyText}>No staff assigned to this branch</div>
                        )}
                      </div>

                      {/* Branch Footer */}
                      <div className={styles.branchToggleBar}>
                        <span className={styles.deptCountLabel}>
                          {branch.departments.length} Departments
                        </span>
                        <button
                          type="button"
                          className={styles.toggleDeptBtn}
                          onClick={() => toggleBranchCollapse(branch.id)}
                        >
                          {isCollapsed ? (
                            <>
                              <span>Show Depts</span>
                              <ChevronDown size={13} />
                            </>
                          ) : (
                            <>
                              <span>Hide Depts</span>
                              <ChevronUp size={13} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bottom Wire Port Pin */}
                      {!isCollapsed && <div className={styles.nodePortBottom} style={{ backgroundColor: '#2563EB' }} />}
                    </div>

                    {/* ============================================================= */}
                    {/* LEVEL 3: DEPARTMENTS UNDER THIS BRANCH                        */}
                    {/* ============================================================= */}
                    {!isCollapsed && (
                      <>
                        <div className={styles.deptListGap} />
                        <div className={styles.deptArray}>
                          {branch.departments.map(dept => {
                            const isDeptMatched = isMatch(dept.name) || 
                              dept.staff.some(s => isMatch(s.fullName) || isMatch(s.designation));

                            return (
                              <div 
                                key={dept.id} 
                                className={`${styles.deptNodeCard} ${isDeptMatched ? styles.highlightedNode : ''}`}
                              >
                                <div className={styles.deptCardHeader}>
                                  <div className={styles.deptTitleGroup}>
                                    <div className={styles.deptIconBox}>
                                      <LibraryBig size={13} />
                                    </div>
                                    <span className={styles.deptTitle}>{dept.name}</span>
                                  </div>
                                  <span className={styles.deptBatchTag}>
                                    {dept.batches.length} {dept.batches.length === 1 ? 'Batch' : 'Batches'}
                                  </span>
                                </div>

                                {/* Department Assigned Instructors */}
                                <div className={styles.deptFacultyBox}>
                                  {dept.staff.length > 0 ? (
                                    dept.staff.map(s => (
                                      <div 
                                        key={s.id}
                                        className={styles.deptFacultyItem}
                                        onClick={() => setSelectedStaff(s)}
                                        title="Click to view coordinator details"
                                      >
                                        <User size={12} color="#10B981" />
                                        <span className={styles.facultyName}>{s.fullName}</span>
                                        <span className={styles.facultyRole}>{s.designation || 'Faculty'}</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className={styles.emptyText}>Shared Central Faculty</div>
                                  )}
                                </div>

                                {/* Active Batches Mini Chips */}
                                {dept.batches.length > 0 && (
                                  <div className={styles.deptBatchesGrid}>
                                    {dept.batches.map(b => (
                                      <span key={b.id} className={styles.batchBadge}>
                                        {b.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detail Drawer for Selected Staff Member */}
      {selectedStaff && (
        <div className={styles.drawerOverlay}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>Staff Profile</span>
            <button 
              type="button" 
              className={styles.drawerCloseBtn}
              onClick={() => setSelectedStaff(null)}
              aria-label="Close Details Drawer"
            >
              ✕
            </button>
          </div>

          <div className={styles.drawerBody}>
            <div className={styles.drawerHero}>
              <UserAvatar name={selectedStaff.fullName} size="lg" />
              <span className={styles.drawerHeroName}>{selectedStaff.fullName}</span>
              <span className={styles.drawerHeroDesig}>{selectedStaff.designation || 'Academy Staff'}</span>
              <div style={{ marginTop: '8px' }}>
                <StatusBadge 
                  status={selectedStaff.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Coordinator'} 
                  variant={selectedStaff.role === 'SUPER_ADMIN' ? 'purple' : 'info'} 
                />
              </div>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Branch Assignment</span>
              <span className={styles.drawerValue}>
                <Building2 size={14} color="#64748B" />
                {selectedStaff.branch?.name || 'Central Directorate (HQ)'}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Contact Email</span>
              <span className={styles.drawerValue}>
                <Mail size={14} color="#64748B" />
                {selectedStaff.email || 'N/A'}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Phone Number</span>
              <span className={styles.drawerValue}>
                <Phone size={14} color="#64748B" />
                {selectedStaff.phone || 'N/A'}
              </span>
            </div>

            <div className={styles.drawerField}>
              <span className={styles.drawerLabel}>Joining Date</span>
              <span className={styles.drawerValue}>
                <Calendar size={14} color="#64748B" />
                {selectedStaff.joiningDate || 'N/A'}
              </span>
            </div>

            {selectedStaff.assignedDepartments && selectedStaff.assignedDepartments.length > 0 && (
              <div className={styles.drawerField}>
                <span className={styles.drawerLabel}>Assigned Departments</span>
                <div className={styles.drawerChips}>
                  {selectedStaff.assignedDepartments.map(ad => (
                    <span key={ad.id} className={styles.drawerChipItem}>
                      {ad.department.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStaff.assignedBatches && selectedStaff.assignedBatches.length > 0 && (
              <div className={styles.drawerField}>
                <span className={styles.drawerLabel}>Coordinated Batches</span>
                <div className={styles.drawerChips}>
                  {selectedStaff.assignedBatches.map(ab => (
                    <span key={ab.id} className={styles.drawerChipItem}>
                      {ab.batch.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedStaff.notes && (
              <div className={styles.drawerField}>
                <span className={styles.drawerLabel}>Notes & Instructions</span>
                <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                  {selectedStaff.notes}
                </span>
              </div>
            )}

            {onEditStaff && (
              <button 
                type="button" 
                className={styles.hudBtnActive} 
                style={{ height: '36px', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }}
                onClick={() => {
                  const staff = selectedStaff;
                  setSelectedStaff(null);
                  onEditStaff(staff);
                }}
              >
                Edit Staff Information
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
