import { Contract } from '@/constants/data';
import { fakeContracts } from '@/constants/mock-api';
import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as ContractTable } from '@/components/ui/table/data-table';
import { columns } from './contract-tables/columns';

type ContractListingPage = {};

export default async function ContractListingPage({}: ContractListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');
  const categories = searchParamsCache.get('categories');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const data = await fakeContracts.getContracts(filters);
  const totalContracts = data.total_contracts;
  const contracts: Contract[] = data.contracts;

  return (
    <ContractTable
      columns={columns}
      data={contracts}
      totalItems={totalContracts}
    />
  );
}
