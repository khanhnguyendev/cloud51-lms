export const calculateFee = (totalAmount: number, feeRate: number) => {
  return Math.max(totalAmount * feeRate, 200000);
};

/**
 * Step will be 7 days
 * If contract type is loan, there will be 4 installments
 * If contract type is lease, there will be 8 installments
 * Skip the first week
 *
 * @param {*} contractDate
 * @param {*} contractType
 * @param {*} totalAmount
 * @returns Array of installments with amount and date
 */
export const calculateInstallments = (
  contractDate: string,
  contractType: string,
  totalAmount: number
) => {
  const installmentCount = contractType === 'loan' ? 4 : 8;
  const installmentValue = totalAmount * 0.02 + totalAmount / installmentCount;

  return Array.from({ length: installmentCount }, (_, i) => {
    const currentInstallmentDate = new Date(contractDate);
    currentInstallmentDate.setDate(
      currentInstallmentDate.getDate() + 7 * (i + 1)
    ); // Start from week 1
    return {
      amount: installmentValue,
      date: currentInstallmentDate
    };
  });
};

/**
 * Calculate due date based on contract type
 * Loan: 4 weeks
 * Lease: 8 weeks
 *
 */
export const calculateDueDate = (
  contractType: string,
  contractDate: string
) => {
  const dueDate = new Date(contractDate);
  dueDate.setDate(
    dueDate.getDate() + (contractType === 'loan' ? 7 * 4 : 7 * 8)
  );
  return dueDate;
};
