import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PreviewClient from './_components/preview-client';

export default async function OrderPreviewPage() {
  const session = await auth();

  if (!session?.user?.accessToken) {
    redirect('/login?callbackUrl=/don-hang/preview');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Truyền accessToken xuống client component */}
        <PreviewClient accessToken={session.user.accessToken} />
      </div>
    </main>
  );
}