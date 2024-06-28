import Form from '@/app/ui/casts/edit-form';
import Breadcrumbs from '@/app/ui/casts/breadcrumbs';
import { fetchCastByHash } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { hash: string } }) {
  const hash = params.hash;
  const cast = await fetchCastByHash(hash);

  if (!cast) {
    notFound();
  }
  
  return (
    <main  className="flex justify-center">
      <div>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Casts', href: '/dashboard/casts' },
          {
            label: 'Edit Cast',
            href: `/dashboard/casts/${hash}/edit`,
            active: true,
          },
        ]}
      />
      <Form cast={cast} />
      </div>
    </main>
  );
}
