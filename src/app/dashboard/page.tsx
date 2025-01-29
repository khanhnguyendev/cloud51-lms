import { auth } from '@/lib/auth';
import { initializeModels } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/');
  } else {
    await initializeModels();
    redirect('/dashboard/overview');
  }
}
