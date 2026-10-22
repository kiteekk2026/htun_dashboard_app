'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert" className="flex h-full flex-col items-center justify-center gap-3 py-16">
      <h2 className="text-center text-lg font-medium">Something went wrong!</h2>
      <p className="text-sm text-gray-600">
        We couldn&apos;t load or save customer data.
      </p>
      <button
        className="mt-2 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}