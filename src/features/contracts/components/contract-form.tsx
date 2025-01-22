'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CONTRACTS_API } from '@/constants/route-api';
import { useRouter } from 'next/navigation';
import { IContract } from '@/models/contract';

const formSchema = z.object({
  contractDate: z
    .string()
    .min(1, { message: 'Ngày tạo hợp đồng là bắt buộc.' }),
  contractCode: z.string().min(1, { message: 'Mã hợp đồng là bắt buộc.' }),
  contractType: z.enum(['loan', 'lease'], {
    message: 'Chọn loại hợp đồng.'
  }),
  deviceType: z.string().min(1, { message: 'Loại thiết bị là bắt buộc.' }),
  deviceImei: z
    .string()
    .regex(/^\d+$/, { message: 'IMEI phải là số.' })
    .min(1, { message: 'IMEI thiết bị là bắt buộc.' }),
  totalAmount: z
    .number()
    .positive({ message: 'Số tiền tổng phải là một số dương.' }),
  customerName: z.string().min(2, { message: 'Tên KH là bắt buộc' }),
  customerPhone: z
    .string()
    .regex(/^\d{10}$/, {
      message: 'Số điện thoại phải là số hợp lệ gồm 10 chữ số.'
    })
    .min(1, { message: 'Số điện thoại là bắt buộc.' }),
  note: z.string().optional()
});

export default function ContractForm({
  initialData,
  pageTitle
}: {
  initialData: any;
  pageTitle: string;
}) {
  const router = useRouter();

  const [fee, setFee] = useState(0);
  const [installments, setInstallments] = useState<
    { amount: number; date: string }[]
  >([]);
  const deviceTypes = [
    'iPhone 16',
    'iPhone 16 Plus',
    'iPhone 16 Pro',
    'iPhone 16 Pro Max',
    'iPhone 15',
    'iPhone 15 Plus',
    'iPhone 15 Pro',
    'iPhone 15 Pro Max',
    'iPhone 14',
    'iPhone 14 Plus',
    'iPhone 14 Pro',
    'iPhone 14 Pro Max',
    'iPhone 13',
    'iPhone 13 Mini',
    'iPhone 13 Pro',
    'iPhone 13 Pro Max',
    'iPhone 12',
    'iPhone 12 Mini',
    'iPhone 12 Pro',
    'iPhone 12 Pro Max',
    'iPhone 11',
    'iPhone 11 Pro',
    'iPhone 11 Pro Max'
  ];

  const defaultValues = {
    contractDate:
      new Date(initialData?.contractDate).toISOString().split('T')[0] ||
      new Date().toISOString().split('T')[0],
    contractCode: initialData?.contractCode || '',
    contractType: initialData?.contractType || 'loan',
    deviceType: initialData?.deviceType || '',
    deviceImei: initialData?.deviceImei || '',
    totalAmount: initialData?.totalAmount || 1000000,
    customerName: initialData?.user?.name || '',
    customerPhone: initialData?.user?.phones[0]?.number || '',
    note: initialData?.note || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  useEffect(() => {
    const totalAmount = form.watch('totalAmount');
    const contractType = form.watch('contractType');
    const contractDate = form.watch('contractDate');
    calculateFeeAndInstallments(totalAmount, contractType, contractDate);
  }, [
    form.watch('totalAmount'),
    form.watch('contractType'),
    form.watch('contractDate')
  ]);

  const calculateFeeAndInstallments = (
    totalAmount: number,
    contractType: string,
    contractDate: string
  ) => {
    if (!totalAmount || !contractType || !contractDate) {
      setInstallments([]);
      return;
    }

    const calculatedFee = Math.max(totalAmount * 0.1, 200000);
    setFee(calculatedFee);

    const installmentCount = contractType === 'loan' ? 4 : 8;
    const installmentValue =
      totalAmount * 0.02 + totalAmount / installmentCount;

    const installmentArray = Array.from(
      { length: installmentCount },
      (_, i) => {
        const date = new Date(contractDate);
        date.setDate(date.getDate() + 7 * (i + 1));
        return {
          amount: installmentValue,
          date: date.toLocaleDateString('vi-VN')
        };
      }
    );

    setInstallments(installmentArray);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dataToSubmit = { ...values };

    const createContract = async () => {
      const response = await fetch(CONTRACTS_API.CREATE_CONTRACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes?.error || 'Unknown error occurred');
      }

      const result = await response.json();
      return result.message;
    };

    toast.promise(createContract(), {
      loading: 'Đang tạo hợp đồng...',
      success: (contract: IContract) => {
        router.push(`/dashboard/contract/${contract._id}`);
        return 'Hợp đồng được tạo thành công!';
      },
      error: (error: Error) => error.message || 'Tạo hợp đồng thất bại!'
    });
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-2'>
              <FormField
                control={form.control}
                name='contractDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày tạo hợp đồng</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='customerName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên KH</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập tên KH' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='customerPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập số điện thoại' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='contractCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã hợp đồng</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập mã hợp đồng' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='contractType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hợp đồng</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại hợp đồng' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='loan'>Vay</SelectItem>
                        <SelectItem value='lease'>Góp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='deviceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại thiết bị</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn loại thiết bị' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='deviceImei'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMEI thiết bị</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập IMEI thiết bị' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='totalAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền tổng</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Chọn số tiền tổng' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(
                          { length: (10000000 - 1000000) / 500000 + 1 },
                          (_, index) => 1000000 + index * 500000
                        ).map((amount) => (
                          <SelectItem key={amount} value={amount.toString()}>
                            {amount.toLocaleString()} VND
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Phí (10%)</FormLabel>
                <div>{fee.toLocaleString()} VND</div>
              </FormItem>
              <FormItem>
                <FormLabel className='text-gray-800 dark:text-gray-200'>
                  Các kỳ trả góp
                </FormLabel>
                <div
                  className={`grid gap-4 ${
                    form.watch('contractType') === 'loan'
                      ? 'grid-cols-4'
                      : 'grid-cols-4 grid-rows-2'
                  }`}
                >
                  {installments.map((installment, index) => (
                    <div
                      key={index}
                      className='rounded-md border bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800'
                    >
                      <p className='font-bold text-gray-800 dark:text-gray-100'>
                        Kỳ {index + 1}
                      </p>
                      <p className='font-bold text-red-600 dark:text-red-400'>
                        {installment.amount.toLocaleString()} VND
                      </p>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {installment.date}
                      </p>
                    </div>
                  ))}
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Input placeholder='Nhập ghi chú' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='mt-6'>
              <Button variant='destructive' className='' type='submit'>
                Tạo hợp đồng
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
