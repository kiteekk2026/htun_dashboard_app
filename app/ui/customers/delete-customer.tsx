'use client';

import { useActionState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteCustomer } from '@/app/lib/actions';

export function DeleteCustomer({
  id,
  name,
  query,
  page,
}: {
  id: string;
  name: string;
  query: string;
  page: number;
}) {
  const deleteWithArgs = deleteCustomer.bind(null, id, query, page);
  const [state, formAction, isPending] = useActionState(deleteWithArgs, {
    message: null,
  });

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete ${name}? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border p-2 hover:bg-gray-100 disabled:opacity-50"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
      {state.message && (
        <p role="alert" className="mt-2 max-w-48 text-xs text-red-500">
          {state.message}
        </p>
      )}
    </form>
  );
}