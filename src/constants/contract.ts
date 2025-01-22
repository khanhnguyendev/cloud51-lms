export const CONTRACT_FEE = 0.1;

export const CONTRACT_TYPE = Object.freeze({
  LOAN: 'loan',
  LEASE: 'lease'
});

export const CONTRACT_STATUS = Object.freeze({
  NEW: 'NEW',
  PENDING: 'PENDING',
  PAID_ON_TIME: 'PAID_ON_TIME',
  PAID_LATE: 'PAID_LATE',
  OVERDUE: 'OVERDUE',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  CANCELLED: 'CANCELLED'
});
