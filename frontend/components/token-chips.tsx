'use client';

export function TokenChips({ tokens }: { tokens: string[] }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-apple-body text-apple-ink-muted-80 italic">
        No tokens generated
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token, idx) => (
        <div
          key={idx}
          className="configurator-chip border border-apple-hairline bg-apple-surface-pearl text-apple-ink"
        >
          {token}
        </div>
      ))}
    </div>
  );
}
