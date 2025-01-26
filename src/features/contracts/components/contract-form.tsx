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
import { useRouter } from 'next/navigation';
import { IContract } from '@/models/contract';
import { ITransaction } from '@/models/transaction';

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
  action
}: {
  initialData: any;
  action: string;
}) {
  const router = useRouter();

  const [fee, setFee] = useState(0);
  const [installments, setInstallments] = useState<
    {
      _id: string;
      amount: number;
      partialAmount: number;
      paymentDate: string;
      paidStatus: string;
    }[]
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
    contractDate: initialData?.contractDate
      ? new Date(initialData?.contractDate).toISOString().split('T')[0]
      : initialData?.contractDate || new Date().toISOString().split('T')[0],
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

  const calculatedFee = (totalAmount: number) => {
    setFee(Math.max(totalAmount * 0.1, 200000));
  };

  useEffect(() => {
    const totalAmount = form.watch('totalAmount');
    const contractType = form.watch('contractType');
    const contractDate = form.watch('contractDate');

    if (action === 'update' && initialData?.transactions) {
      const updatedInstallments = initialData.transactions.map(
        (transaction: any) => ({
          _id: transaction._id,
          amount: transaction.amount,
          partialAmount: transaction.partialAmount || 0,
          paymentDate: new Date(transaction.paymentDate)
            .toISOString()
            .split('T')[0],
          paidStatus: transaction.paidStatus || 'NOT_PAID'
        })
      );
      setInstallments(updatedInstallments);
      calculatedFee(totalAmount);
    } else {
      calculateFeeAndInstallments(totalAmount, contractType, contractDate);
    }
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

    calculatedFee(totalAmount);

    const installmentCount = contractType === 'loan' ? 4 : 8;
    const installmentValue =
      totalAmount * 0.02 + totalAmount / installmentCount;

    const installmentArray = Array.from(
      { length: installmentCount },
      (_, i) => {
        const date = new Date(contractDate);
        date.setDate(date.getDate() + 7 * (i + 1));
        return {
          _id: '',
          amount: installmentValue,
          paymentDate: date.toLocaleDateString('vi-VN'),
          partialAmount: 0,
          paidStatus: 'NOT_PAID'
        };
      }
    );

    setInstallments(installmentArray);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (action === 'new') {
      const dataToSubmit = { ...values };

      const createContract = async () => {
        const response = await fetch('/api/v1/contracts', {
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
    }

    if (action === 'update') {
      const updateInstallments = async () => {
        const response = await fetch('/api/v1/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(installments)
        });

        if (!response.ok) {
          const errorRes = await response.json();
          throw new Error(errorRes?.error || 'Unknown error occurred');
        }

        const result = await response.json();
        return result.message;
      };

      toast.promise(updateInstallments(), {
        loading: 'Đang cập nhật các kỳ trả góp...',
        success: (transactions: ITransaction[]) => {
          router.refresh();
          return 'Cập nhật kỳ trả góp thành công!';
        },
        error: (error: Error) =>
          error.message || 'Cập nhật kỳ trả góp thất bại!'
      });
    }
  };

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {action == 'new' ? 'Tạo hợp đồng' : 'Cập nhật hợp đồng'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-2'>
              {/* Contract Date */}
              <FormField
                control={form.control}
                name='contractDate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày tạo hợp đồng</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        {...field}
                        disabled={action === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Contract Code */}
              <FormField
                control={form.control}
                name='contractCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã hợp đồng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập mã hợp đồng'
                        {...field}
                        disabled={action === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Customer Name */}
              <FormField
                control={form.control}
                name='customerName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên KH</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập tên KH'
                        {...field}
                        disabled={action === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Customer Phone */}
              <FormField
                control={form.control}
                name='customerPhone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập số điện thoại'
                        {...field}
                        disabled={action === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Contract Type */}
              <FormField
                control={form.control}
                name='contractType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hợp đồng</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      disabled={action === 'update'}
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
              {/* Device Type */}
              <FormField
                control={form.control}
                name='deviceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại thiết bị</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      disabled={action === 'update'}
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
              {/* Device IMEI */}
              <FormField
                control={form.control}
                name='deviceImei'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMEI thiết bị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập IMEI thiết bị'
                        {...field}
                        disabled={action === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Total Amount */}
              <FormField
                control={form.control}
                name='totalAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ''}
                      disabled={action === 'update'}
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
              {/* Fee */}
              {/* <FormItem>
                <FormLabel>Phí (10%)</FormLabel>
                <div>{fee.toLocaleString()} VND</div>
              </FormItem> */}
              {/* Note */}
              {/* <FormField
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
              /> */}

              <Card className='mx-auto w-full'>
                <CardHeader>
                  <CardTitle className='text-left text-2xl font-bold'>
                    Các kỳ trả góp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Installment Info */}
                  <FormItem>
                    <div
                      className={`xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4`}
                    >
                      {installments.map((installment, index) => (
                        <div
                          key={index}
                          className='flex flex-col rounded-lg border p-4 shadow-md dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between'
                        >
                          {/* Installment Info */}
                          <div className='space-y-2 sm:flex sm:items-center sm:gap-4 sm:space-y-0'>
                            <div className='text-center sm:text-left'>
                              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                Kỳ {index + 1}
                              </p>
                              <p className='text-sm text-gray-500 dark:text-gray-400'>
                                Ngày: {installment.paymentDate}
                              </p>
                              <p className='text-sm font-medium text-red-600 dark:text-red-400'>
                                {installment.amount.toLocaleString()} VND
                              </p>
                            </div>
                          </div>

                          {/* Payment Status and Additional Input */}
                          <div className='mt-4 space-y-2 text-center'>
                            {/* Payment Status Dropdown */}
                            <FormItem>
                              <FormLabel className='text-sm text-gray-700 dark:text-gray-300'>
                                Trạng thái
                              </FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  const updatedInstallments = [...installments];
                                  updatedInstallments[index] = {
                                    ...installment,
                                    paidStatus: value,
                                    partialAmount:
                                      value === 'PAID_ALL'
                                        ? installment.amount // Set partialAmount to amount if PAID_ALL
                                        : value === 'PARTIALLY_PAID'
                                          ? installment.partialAmount || 0
                                          : 0
                                  };
                                  setInstallments(updatedInstallments);
                                }}
                                value={installment.paidStatus || 'NOT_PAID'}
                                disabled={action === 'new'}
                              >
                                <FormControl>
                                  <SelectTrigger className='mx-auto w-fit'>
                                    <SelectValue placeholder='Chọn trạng thái thanh toán' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value='NOT_PAID'>
                                    Chưa thanh toán
                                  </SelectItem>
                                  <SelectItem value='PAID_ALL'>
                                    Đã thanh toán
                                  </SelectItem>
                                  <SelectItem value='PARTIALLY_PAID'>
                                    Thanh toán một phần
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>

                            {/* Paid Amount Input */}
                            {installment.paidStatus === 'PARTIALLY_PAID' && (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='Nhập số tiền'
                                    value={installment.partialAmount || ''}
                                    onChange={(e) => {
                                      const updatedInstallments = [
                                        ...installments
                                      ];
                                      updatedInstallments[index] = {
                                        ...installment,
                                        partialAmount: Number(e.target.value)
                                      };
                                      setInstallments(updatedInstallments);
                                    }}
                                    className='w-full sm:w-48'
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormItem>
                </CardContent>
              </Card>
            </div>
            <div className='mt-6'>
              <Button variant='destructive' type='submit'>
                {action == 'new' ? 'Tạo hợp đồng' : 'Cập nhật hợp đồng'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
