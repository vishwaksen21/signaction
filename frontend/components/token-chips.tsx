'use client';

interface TokenChipsProps {
  tokens: string[];
  activeIndex?: number;
}

export function TokenChips({ tokens, activeIndex }: TokenChipsProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="text-apple-body text-apple-ink-muted-80 italic">
        No tokens generated
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token, idx) => {
        const isActive = activeIndex !== undefined && activeIndex === idx;
        return (
          <div
            key={idx}
            className={`configurator-chip border transition-all duration-150 ${
              isActive
                ? 'border-blue-500 bg-blue-500 text-white font-semibold shadow-sm scale-105'
                : 'border-apple-hairline bg-apple-surface-pearl text-apple-ink'
            }`}
          >
            {token}
          </div>
        );
      })}
    </div>
  );
}
