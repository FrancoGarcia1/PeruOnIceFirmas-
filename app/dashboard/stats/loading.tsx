export default function StatsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-44 bg-ice-dark/30 rounded-lg" />
        <div className="h-4 w-64 bg-ice-dark/20 rounded-lg mt-2" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-3 w-24 bg-ice-dark/20 rounded" />
                <div className="h-8 w-16 bg-ice-dark/25 rounded-lg mt-3" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-ice-dark/15" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-ice-dark/20" />
        <div className="p-4 md:p-6">
          <div className="h-3 w-56 bg-ice-dark/20 rounded mb-6" />
          <div className="h-60 md:h-80 bg-ice-dark/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
