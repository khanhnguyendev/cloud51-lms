'use client';

import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IContract } from '@/models/contract';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CellActionProps {
  data: IContract;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    setLoading(true);
    let onError = false;
    const deleteContract = async () => {
      const res = await fetch(`/api/v1/contracts/${data._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errorRes = await res.json();
        onError = true;
        throw new Error(errorRes?.error || 'Unknown error occurred');
      }

      const result = await res.json();
      return result.message;
    };

    try {
      toast.promise(deleteContract(), {
        loading: 'Đang xoá hợp đồng...',
        success: 'Xoá hợp đồng thành công!',
        error: (error: Error) => error.message || 'Xoá hợp đồng thất bại!'
      });

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      if (!onError) window.location.reload();
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/contract/${data._id}`)}
          >
            <Edit className='mr-2 h-4 w-4' /> Sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className='mr-2 h-4 w-4' /> Xoá
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
