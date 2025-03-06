import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import HomeComponent from './HomeComponent';

export default async function Page() {
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/signin');
  }
  return <HomeComponent />;
}