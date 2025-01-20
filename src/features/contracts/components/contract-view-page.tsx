import { fakeContracts, Contract } from '@/constants/mock-api';
import { notFound } from 'next/navigation';
import ContractForm from './contract-form';

type TContractViewPageProps = {
  contractId: string;
};

export default async function ContractViewPage({
  contractId
}: TContractViewPageProps) {
  let contract = null;
  let pageTitle = 'Tạo mới hợp đồng';

  if (contractId !== 'new') {
    const data = await fakeContracts.getContractById(Number(contractId));
    contract = data.contract as Contract;
    if (!contract) {
      notFound();
    }
    pageTitle = `Chỉnh sửa hợp đồng`;
  }

  return <ContractForm initialData={contract} pageTitle={pageTitle} />;
}
