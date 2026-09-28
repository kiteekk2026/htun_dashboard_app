import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  InboxStackIcon,
} from '@heroicons/react/24/outline';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { fetchCustomerById, fetchInvoicesByCustomerId } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customer',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const customer = await fetchCustomerById(id);
  if (!customer) notFound();

  const invoices = await fetchInvoicesByCustomerId(id);

  // Progress bar အတွက် raw amount (cents) ကနေ တွက်ပါတယ်
  const paidRaw = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);
  const pendingRaw = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = paidRaw + pendingRaw;
  const paidPercent = grandTotal > 0 ? Math.round((paidRaw / grandTotal) * 100) : 0;

  const stats = [
    {
      label: 'Total Invoices',
      value: customer.total_invoices,
      icon: InboxStackIcon,
      accent: 'border-blue-500',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Pending',
      value: customer.total_pending,
      icon: ClockIcon,
      accent: 'border-amber-500',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Paid',
      value: customer.total_paid,
      icon: CheckCircleIcon,
      accent: 'border-green-500',
      iconBg: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <main className="w-full">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Customers', href: '/dashboard/customers' },
          {
            label: customer.name,
            href: `/dashboard/customers/${id}`,
            active: true,
          },
        ]}
      />

      {/* Hero header */}
      <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 md:h-28" />
        <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end">
          <Image
            src={customer.image_url}
            alt={`${customer.name}'s profile picture`}
            width={96}
            height={96}
            className="-mt-12 rounded-full border-4 border-white bg-white shadow-md"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {customer.name}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <EnvelopeIcon className="h-4 w-4" />
              {customer.email}
            </p>
          </div>
          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-500">
            ID: {id.slice(0, 8)}…
          </span>
        </div>
      </section>

      {/* Stat cards */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div
            key={label}
            className={`flex items-center gap-4 rounded-xl border-l-4 bg-white p-5 shadow-sm ring-1 ring-gray-200 ${accent}`}
          >
            <div className={`rounded-lg p-3 ${iconBg}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Paid vs pending bar */}
      {grandTotal > 0 && (
        <section className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <BanknotesIcon className="h-4 w-4" />
              Payment progress
            </span>
            <span className="text-gray-500">{paidPercent}% paid</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </section>
      )}

      {/* Invoice history */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-medium text-gray-900">
          Invoice history
        </h2>

        {invoices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-10 text-center">
            <InboxStackIcon className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-600">
              This customer has no invoices yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <table className="min-w-full text-gray-900">
              <thead className="bg-gray-50 text-left text-sm">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium">Amount</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    className={`border-t text-sm ${
                      index === 0 ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      {formatDateToLocal(invoice.date)}
                      {index === 0 && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Latest
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <InvoiceStatus status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}