export default function ContractDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="h-5 w-16 bg-ice-dark/20 rounded" />
        <div className="hidden sm:block w-px h-6 bg-ice-dark" />
        <div className="h-7 w-52 bg-ice-dark/30 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract data skeleton */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-ice-dark/20" />
          <div className="p-4 md:p-6 space-y-5">
            <div className="h-3 w-36 bg-ice-dark/20 rounded" />
            <div className="h-5 w-48 bg-ice-dark/25 rounded" />
            <div className="h-3 w-20 bg-ice-dark/20 rounded" />
            <div className="h-5 w-32 bg-ice-dark/25 rounded" />
            <div className="h-3 w-28 bg-ice-dark/20 rounded" />
            <div className="h-5 w-40 bg-ice-dark/25 rounded" />
          </div>
        </div>

        {/* Signature skeleton */}
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-ice-dark/20" />
          <div className="p-4 md:p-6">
            <div className="h-3 w-28 bg-ice-dark/20 rounded mb-5" />
            <div className="h-48 bg-ice-dark/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
