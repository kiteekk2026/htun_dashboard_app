import { Metadata } from 'next';
import Search from '@/app/ui/search';

export const metadata: Metadata = {
  title: 'Customers',
  description: 'The Next.js Learn Customers page',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};


import { lusitana } from '@/app/ui/fonts';
import { fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';

 

export default async function Page() {
  const customers = await fetchFilteredCustomers('');
 
  return (
    <div className={`${lusitana.className} mt-6 flow-root`}>
      <div className="inline-block min-w-full align-middle">  
        <CustomersTable customers={customers} />
        </div>
      </div>
    )
    
}