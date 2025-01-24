'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { IContract } from '@/models/contract';

export const columns: ColumnDef<IContract>[] = [
  {
    accessorKey: 'contractDate',
    header: 'Ngày tạo HĐ',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  },
  {
    accessorKey: 'contractCode',
    header: 'Mã HĐ'
  },
  {
    accessorKey: 'user.name',
    header: 'Tên KH',
    cell: ({ getValue }) => getValue<string>() || 'N/A'
  },
  {
    accessorKey: 'user.phones',
    header: 'SĐT',
    cell: ({ getValue }) => {
      const phones = getValue<{ number: string }[]>();
      return phones && phones[0]?.number ? phones[0].number : 'N/A';
    }
  },
  {
    // loan: Vay
    // lease: Góp
    accessorKey: 'contractType',
    header: 'Loại HĐ',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return value === 'loan' ? 'Vay' : 'Góp';
    }
  },
  {
    accessorKey: 'totalAmount',
    header: 'Tổng tiền',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    }
  },
  // {
  //   accessorKey: 'fee',
  //   header: 'FEE',
  //   cell: ({ getValue }) => {
  //     const value = getValue<number>();
  //     return value.toLocaleString('vi-VN', {
  //       style: 'currency',
  //       currency: 'VND'
  //     });
  //   }
  // },
  // {
  //   accessorKey: 'note',
  //   header: 'Ghi chú'
  // },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
