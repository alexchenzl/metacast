import Pagination from '@/app/ui/casts/pagination';
import Search from '@/app/ui/casts/filter';
import Table from '@/app/ui/casts/table';
import { lusitana } from '@/app/ui/fonts';
import { CastsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchCastsPages } from '@/app/lib/data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casts',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    period?: string;
    tag?: string;
    page?: string;
  };
}) {
  const period = searchParams?.period || 'latest';
  const tag = searchParams?.tag || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCastsPages(period, tag);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Casts</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search by tag" />
      </div>
      <Suspense
        key={period + '-' + tag + currentPage}
        fallback={<CastsTableSkeleton />}
      >
        <Table period={period} tag={tag} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
