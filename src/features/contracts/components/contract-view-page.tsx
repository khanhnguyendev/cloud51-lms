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
  let pageTitle = 'Tạo mới hợp đồng';

  if (contractId) {
    try {
      const data = await fetchContractById(contractId);
      contract = data as IContract;

      if (!contract) {
        notFound();
      }

      pageTitle = `Chỉnh sửa hợp đồng`;
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      notFound();
    }
  }

  return <ContractForm initialData={contract} pageTitle={pageTitle} />;
}
