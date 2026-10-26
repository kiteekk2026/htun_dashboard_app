'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateCustomer } from '@/app/lib/actions';
import { CustomerField } from '@/app/lib/definitions';
import id from 'zod/v4/locales/id.js';

const AVATARS = [
     { src: '/customers/amy-burns.png' },
     { src: '/customers/balazs-orban.png' },
     { src: '/customers/delba-de-oliveira.png' },
     { src: '/customers/evil-rabbit.png' },
     { src: '/customers/lee-robinson.png' },
     { src: '/customers/michael-novotny.png' },
 ];

type CustomerFormState = {
  message?: string | null;
   errors?: { name?: string[]; email?: string[]; image_url?: string[] };
  };
  

type EditCustomer = {
   id: string;
   name: string;
   email: string;
   image_url: string;
 };

export default function EditCustomerForm({ customer }: { customer: EditCustomer }) {
   const updateCustomerWithId = updateCustomer.bind(null, customer.id);
   const [state, formAction] = useActionState<CustomerFormState, FormData>(
     updateCustomerWithId,
     { message: null, errors: {} },
   );

   // DB ထဲက image က AVATARS ထဲမှာ မပါရင် ပထမတစ်ခုကို default ထား
   const currentAvatar = AVATARS.some((a) => a.src === customer.image_url)
     ? customer.image_url
     : AVATARS[0].src;

  return (
  <form action={formAction}>
         <div className="rounded-md bg-gray-50 p-4 md:p-6">
           {/* Name */}
           <div className="mb-4">
             <label htmlFor="name" className="mb-2 block text-sm font-medium">
               Name
             </label>
             <input
               id="name"
               name="name"
               type="text"
               required
               defaultValue={customer.name}
               placeholder="Enter customer name"
               className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
             />
          {state.errors?.name?.map((e) => (
             <p key={e} className="mt-2 text-sm text-red-500">{e}</p>
           ))}
         </div>
         {/* Email */}
         <div className="mb-4">
             <label htmlFor="email" className="mb-2 block text-sm font-medium">
               Email
             </label>
             <input
               id="email"
               name="email"
               type="email"
               required
               defaultValue={customer.email}
               placeholder="name@example.com"
               className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
             />
           {state.errors?.email?.map((e) => (
             <p key={e} className="mt-2 text-sm text-red-500">{e}</p>
           ))}
         </div>
           <fieldset>
             <legend className="mb-2 block text-sm font-medium">
               Choose an avatar
             </legend>
             <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
               {AVATARS.map((a) => (
                 <label key={a.src} className="cursor-pointer">
                   <input
                     type="radio"
                     name="image_url"
                     value={a.src}
                     defaultChecked={a.src === currentAvatar}
                     required
                     className="peer sr-only"
                   />
                   <div className="flex flex-col items-center gap-1 rounded-md border-2 border-transparent bg-white p-2 transition-colors hover:bg-gray-100 peer-checked:border-blue-500 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400">
                     <Image
                       src={a.src}
                       alt="Customer avatar"
                       width={48}
                       height={48}
                       className="rounded-full"
                     />
                   </div>
                 </label>
               ))}
             </div>
           </fieldset>
         {state.message && (
           <p className="mt-4 text-sm text-red-500">{state.message}</p>
         )}

        <div className="mt-6 flex justify-end gap-4">
         <Link
           href="/dashboard/customers"
           className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
         >
           Cancel
         </Link>
         <Button type="submit">Update Customer</Button>
       </div>
     </div>
   </form>
   );
 }