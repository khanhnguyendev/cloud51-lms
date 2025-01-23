import { notFound } from 'next/navigation';
import ContractForm from './contract-form';
import { fetchContractById } from '@/features/contracts/utils/contracts-service';
import { IContract } from '@/models/contract';

type TContractViewPageProps = {
  contractId: string;
};

export default async function ContractViewPage({
  contractId
}: TContractViewPageProps) {
  let contract: IContract | null = null;
  let action = 'new';

  if (contractId && contractId !== 'new') {
    try {
      const data = await fetchContractById(contractId);
      contract = data as IContract;

      if (!contract) {
        notFound();
      }

      action = `update`;
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      notFound();
    }
  }

  return <ContractForm initialData={contract} action={action} />;
}
