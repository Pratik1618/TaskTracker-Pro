'use client';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-sky-600 to-blue-500 transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-medium text-slate-600">
        {Math.round(clampedProgress)}%
      </span>
    </div>
  );
}
