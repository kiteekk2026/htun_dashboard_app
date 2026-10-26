import { notFound } from 'next/navigation';
import { fetchCustomerById } from '@/app/lib/data';
import EditCustomerForm from '@/app/ui/customers/edit-form';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const customer = await fetchCustomerById(id);

  if (!customer) notFound();

  return <EditCustomerForm customer={customer} />;
}