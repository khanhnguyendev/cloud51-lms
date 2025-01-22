'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { IContract } from '@/models/contract';

export const columns: ColumnDef<IContract>[] = [
  {
    accessorKey: 'contractDate',
    header: 'CONTRACT DATE',
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
    header: 'CONTRACT CODE'
  },
  {
    accessorKey: 'contractType',
    header: 'CONTRACT TYPE'
  },
  {
    accessorKey: 'deviceType',
    header: 'DEVICE TYPE'
  },
  {
    accessorKey: 'totalAmount',
    header: 'TOTAL AMOUNT',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    }
  },
  {
    accessorKey: 'fee',
    header: 'FEE',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
      });
    }
  },
  {
    accessorKey: 'note',
    header: 'NOTE'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
