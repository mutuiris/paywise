export interface DepartmentSpendItem {
  department: string;
  spent: number;
  requestCount: number;
  topVendor: string;
}

export const DEPARTMENT_SPEND: DepartmentSpendItem[] = [
  { department: 'Engineering & IT', spent: 485000, requestCount: 5, topVendor: 'PowerHire Kenya' },
  { department: 'Operations & Facilities', spent: 395000, requestCount: 4, topVendor: 'Prime Cement Supplies' },
  { department: 'Logistics & Haulage', spent: 340200, requestCount: 3, topVendor: 'SwiftHaul Logistics' },
  { department: 'Admin & Office Supplies', spent: 260000, requestCount: 2, topVendor: 'Metro Hardware Ltd.' },
];
