import { Skeleton } from './ui/skeleton';

export function TokenView({ tokens, loading }: { tokens: string[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="mt-2 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-5/6" />
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
      {tokens.length ? JSON.stringify(tokens, null, 2) : '[]'}
    </div>
  );
}
