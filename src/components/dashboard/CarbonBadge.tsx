'use client';

import { useState, type JSX } from 'react';
import {
  generateBadgePng,
  downloadPng,
  TARGET_TONNES,
  PER_CAPITA_AVERAGE_TONNES,
  type FootprintResult,
  type FootprintInput,
} from '@/lib';
import { Button, Icon } from '@/components/ui';
import { REGION_LABELS } from '@/components/labels';
import { useTheme } from '@/components/layout/ThemeProvider';

export interface CarbonBadgeProps {
  result: FootprintResult;
  input: FootprintInput;
}

/**
 * Renders a preview of the shareable carbon badge and provides a download
 * button. The PNG is generated on-demand via the Canvas API.
 */
export function CarbonBadge({ result, input }: CarbonBadgeProps): JSX.Element {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');

  // Find top category
  const categoryEntries = (
    Object.entries(result.categories) as Array<[string, number]>
  ).sort((a, b) => b[1] - a[1]);
  const topCategoryEntry = categoryEntries[0];
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'transport';

  const topCategoryLabel: Record<string, string> = {
    transport: 'Transport',
    home: 'Home energy',
    food: 'Food',
    consumption: 'Shopping',
  };

  async function handleDownload(): Promise<void> {
    setStatus('generating');
    try {
      const png = generateBadgePng({
        totalTonnes: result.totalTonnes,
        totalKg: result.totalKg,
        targetTonnes: TARGET_TONNES,
        regionLabel: REGION_LABELS[input.region],
        regionAverage: PER_CAPITA_AVERAGE_TONNES[input.region],
        topCategory: topCategoryLabel[topCategory] ?? topCategory,
        topCategoryKg: result.categories[topCategory as keyof typeof result.categories],
        year: new Date().getFullYear(),
        darkMode: theme === 'dark',
      });
      downloadPng(png);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Preview info */}
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-ink">Download your carbon badge</p>
        <p className="text-sm text-ink-muted">
          A 600&times;400 PNG summarizing your footprint, target comparison, and top emission source.
          Matches your current theme.
        </p>
      </div>

      {/* Action */}
      <Button
        id="download-badge-btn"
        onClick={handleDownload}
        disabled={status === 'generating'}
        variant="secondary"
        size="md"
        className="shrink-0"
      >
        {status === 'generating' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Generating...
          </>
        ) : status === 'done' ? (
          <>
            <Icon name="check" size={16} className="text-primary" />
            Downloaded
          </>
        ) : status === 'error' ? (
          <>
            <Icon name="x" size={16} className="text-red-500" />
            Failed — try again
          </>
        ) : (
          <>
            <Icon name="download" size={16} />
            Download badge PNG
          </>
        )}
      </Button>
    </div>
  );
}
