export interface PaymentItem {
  id: string;
  reference: string;
  vendorName: string;
  amount: number;
  invoiceNumber: string;
  paymentMethod: 'MPESA' | 'BANK_TRANSFER';
  accountDetails: string;
  status: 'READY' | 'FAILED' | 'PAID';
  failureReason?: string;
}

export interface PaymentExecutionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  vendorName: string;
  reference: string;
  amount: number;
  successProviderRef: string | null;
  onClose: () => void;
}
