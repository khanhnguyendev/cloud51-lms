'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Contract } from '@/constants/mock-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define form schema based on Contract type
const formSchema = z.object({
  contractDate: z.string().min(1, { message: 'Contract date is required.' }),
  contractCode: z.string().min(1, { message: 'Contract code is required.' }),
  contractType: z.enum(['loan', 'lease'], {
    message: 'Select a contract type.'
  }),
  deviceType: z.string().min(1, { message: 'Device type is required.' }),
  deviceImei: z
    .string()
    .regex(/^\d+$/, { message: 'IMEI must be numeric.' })
    .min(1, { message: 'Device IMEI is required.' }),
  totalAmount: z
    .number()
    .positive({ message: 'Total amount must be a positive number.' }),
  fee: z.number().positive({ message: 'Fee must be a positive number.' }),
  note: z.string().optional()
});

export default function ContractForm({
  initialData,
  pageTitle
}: {
  initialData: Contract | null;
  pageTitle: string;
}) {
  const defaultValues = {
    contractDate: initialData?.contractDate || '',
    contractCode: initialData?.contractCode || '',
    contractType: initialData?.contractType || 'loan',
    deviceType: initialData?.deviceType || '',
    deviceImei: initialData?.deviceImei || '',
    totalAmount: initialData?.totalAmount || 0,
    fee: initialData?.fee || 0,
    note: initialData?.note || ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='contractDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Date</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
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
                  <FormLabel>Contract Code</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter contract code' {...field} />
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
                  <FormLabel>Contract Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select contract type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='loan'>Loan</SelectItem>
                      <SelectItem value='lease'>Lease</SelectItem>
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
                  <FormLabel>Device Type</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter device type' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='deviceImei'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device IMEI</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter device IMEI' {...field} />
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
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='Enter total amount'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder='Enter fee' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter any notes'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Submit Contract</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
