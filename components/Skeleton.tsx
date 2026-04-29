export function SkeletonBox({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`skeleton rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 2, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonJobCard() {
  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <SkeletonBox className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 pt-0.5">
          <SkeletonBox className="h-3.5 w-20" />
          <SkeletonBox className="h-5 w-40" />
        </div>
      </div>
      <SkeletonBox className="mt-4 h-3.5 w-28" />
      <SkeletonBox className="mt-2 h-5 w-32" />
      <div className="mt-4 flex gap-2">
        <SkeletonBox className="h-6 w-20 rounded-full" />
        <SkeletonBox className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonBox className="mt-auto mt-5 h-10 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBox className="h-3.5 w-20" />
          <SkeletonBox className="h-8 w-12" />
        </div>
        <SkeletonBox className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr aria-hidden="true">
      <td className="px-3 py-3">
        <SkeletonBox className="h-4 w-20" />
      </td>
      <td className="px-3 py-3">
        <SkeletonBox className="h-4 w-44" />
      </td>
      <td className="px-3 py-3">
        <SkeletonBox className="h-4 w-24" />
      </td>
      <td className="px-3 py-3">
        <SkeletonBox className="h-6 w-20 rounded-full" />
      </td>
    </tr>
  );
}
