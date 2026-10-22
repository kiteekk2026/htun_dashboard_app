export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-md bg-gray-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-gray-200" />
    </div>
  );
}