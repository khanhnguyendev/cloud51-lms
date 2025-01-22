import { searchParamsCache } from '@/lib/searchparams';
import { DataTable as ContractTable } from '@/components/ui/table/data-table';
import { columns } from './contract-tables/columns';
import { fetchContracts } from '../utils/contracts-service';
import { IContract } from '@/models/contract';

type ContractListingPage = {};

export default async function ContractListingPage({}: ContractListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('q');
  const pageLimit = searchParamsCache.get('limit');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search })
  };

  const data = await fetchContracts(filters);
  const totalContracts = data.total_contracts;
  const contracts = data.contracts;

  return (
    <ContractTable
      columns={columns}
      data={contracts}
      totalItems={totalContracts}
    />
  );
}
