export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 bg-ice-dark/30 rounded-lg" />
        <div className="h-4 w-56 bg-ice-dark/20 rounded-lg mt-2" />
      </div>

      {/* Search skeleton */}
      <div className="h-12 bg-ice-dark/20 rounded-xl mb-6" />

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        <div className="bg-frost border-b border-ice-dark/30 px-6 py-4">
          <div className="h-3 w-full bg-ice-dark/20 rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-b border-ice-dark/10 flex gap-6"
          >
            <div className="h-4 w-36 bg-ice-dark/20 rounded" />
            <div className="h-4 w-24 bg-ice-dark/15 rounded" />
            <div className="h-4 w-32 bg-ice-dark/15 rounded" />
            <div className="h-4 w-28 bg-ice-dark/15 rounded" />
            <div className="ml-auto h-4 w-20 bg-ice-dark/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
