import { Suspense } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import Pagination from '@/app/ui/invoices/pagination';
import CustomersTable from '@/app/ui/customers/table';
import { fetchCustomersPages } from '@/app/lib/data';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchCustomersPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>

      {/* Search + Create ကို table အပေါ်မှာ ထားတယ် */}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <Link
          href="/dashboard/customers/create"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <span className="hidden md:block">Create Customer</span>
          <PlusIcon className="h-5 md:ml-4" />
        </Link>
      </div>

      <Suspense key={query + currentPage} fallback={<p className="mt-6 text-sm text-gray-500">Loading...</p>}>
        <CustomersTable query={query} currentPage={currentPage} />
      </Suspense>

      {totalPages > 1 && (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}