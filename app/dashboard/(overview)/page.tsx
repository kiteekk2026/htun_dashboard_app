import CardWrapper from '@/app/ui/dashboard/cards';
// delete <Card> components import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchLatestInvoices, fetchRevenue } from '@/app/lib/data';
import { Suspense } from 'react';
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton, } from '@/app/ui/skeletons';

async function RevenueChartWrapper() {
  const revenue = await fetchRevenue();
  return <RevenueChart revenue={revenue} />;
}

async function LatestInvoicesWrapper() {
  const latestInvoices = await fetchLatestInvoices();
  return <LatestInvoices latestInvoices={latestInvoices} />;
}

export default async function Page() {
    // Remove `const latestInvoices = await fetchLatestInvoices()`
    // Removeconst { numberOfInvoices, numberOfCustomers, totalPaidInvoices, totalPendingInvoices,} = await fetchCardData();
 
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>

      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChartWrapper />
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoicesWrapper />
        </Suspense>
      </div>
    </main>
  );
}