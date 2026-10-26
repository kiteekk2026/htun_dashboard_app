import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { createCustomer } from '@/app/lib/actions';

const AVATARS = [
  { src: '/customers/amy-burns.png'},
  { src: '/customers/balazs-orban.png'},
  { src: '/customers/delba-de-oliveira.png'},
  { src: '/customers/evil-rabbit.png'},
  { src: '/customers/lee-robinson.png'},
  { src: '/customers/michael-novotny.png'},
];

export default function Form() {
  return (
    <form action={createCustomer}>
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
            placeholder="Enter customer name"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
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
            placeholder="name@example.com"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Avatar picker */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Choose an avatar
          </legend>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {AVATARS.map((a, i) => (
              <label key={a.src} className="cursor-pointer">
                <input
                  type="radio"
                  name="image_url"
                  value={a.src}
                  defaultChecked={i === 0}
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
                  <span className="text-center text-xs text-gray-600">
                    
                 </span>
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Customer</Button>
      </div>
    </form>
  );
}