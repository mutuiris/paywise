export interface DepartmentSummaryRow {
  id: string;
  department: string;
  totalSpent: number;
  approvedCount: number;
  flaggedCount: number;
  status: 'Compliant' | 'Review Needed';
}

export const DEPARTMENT_SUMMARY: DepartmentSummaryRow[] = [
  { id: 'DEP-01', department: 'Engineering & IT', totalSpent: 450000, approvedCount: 12, flaggedCount: 0, status: 'Compliant' },
  { id: 'DEP-02', department: 'Operations & Facilities', totalSpent: 310000, approvedCount: 8, flaggedCount: 1, status: 'Review Needed' },
  { id: 'DEP-03', department: 'Marketing & Comms', totalSpent: 280000, approvedCount: 6, flaggedCount: 0, status: 'Compliant' },
  { id: 'DEP-04', department: 'Human Resources', totalSpent: 200000, approvedCount: 5, flaggedCount: 0, status: 'Compliant' },
];
