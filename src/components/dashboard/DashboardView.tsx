import type { JSX, ReactNode } from 'react';
import {
  calculateFootprint,
  categoryBreakdown,
  compareToAverage,
  compareToTarget,
  formatCo2,
  formatNumber,
  formatPercent,
  formatTonnes,
  generateTips,
  type FootprintInput,
  type HistoryEntry,
  type Goal,
} from '@/lib';
import { generateNarrative } from '@/lib/narratives';
import { calculatePledgeMilestones } from '@/lib/pledge';
import { ButtonLink, Card, Icon } from '@/components/ui';
import { REGION_LABELS } from '@/components/labels';
import { CategoryBarChart, CategoryDonutChart, HistoryTrendChart } from '@/components/charts/lazy';
import { StatCard } from './StatCard';
import { ComparisonCard } from './ComparisonCard';
import { TipCard } from './TipCard';
import { GoalTracker } from './GoalTracker';
import { InsightNarrative } from './InsightNarrative';
import { CountryLeaderboard } from './CountryLeaderboard';
import { WeeklyChallenges } from './WeeklyChallenges';
import { CarbonBadge } from './CarbonBadge';
import { PledgeTimeline } from './PledgeTimeline';

export interface DashboardViewProps {
  input: FootprintInput;
  history: HistoryEntry[];
  /** Pre-loaded goal from localStorage, passed down from the client loader. */
  goal: Goal | null;
}

interface DashboardSectionProps {
  id: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}

function DashboardSection({ id, title, badge, children }: DashboardSectionProps): JSX.Element {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 id={id} className="font-display text-2xl font-bold text-ink">
          {title}
        </h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

/**
 * The full results view, pure in its props. All numbers come from `@/lib`; this
 * component only arranges and labels them. Splitting it out from the localStorage
 * loading shell keeps it deterministic and straightforward to unit test.
 */
export function DashboardView({ input, history, goal }: DashboardViewProps): JSX.Element {
  const result = calculateFootprint(input);
  const breakdown = categoryBreakdown(result);
  const target = compareToTarget(result.totalTonnes);
  const average = compareToAverage(result.totalTonnes, input.region);
  const tips = generateTips(input, result, { limit: 6 });
  const narrative = generateNarrative(input, result);

  const targetHeadline =
    target.ratio <= 1 ? 'Within the target' : `${formatNumber(target.ratio, 2)}× the target`;
  const averageHeadline = `${formatPercent(average.percentOfAverage)} of average`;

  const pledgeProgress = goal
    ? calculatePledgeMilestones(
        goal.baselineTonnes,
        goal.targetTonnes,
        result.totalTonnes,
        history,
      )
    : null;

  return (
    <div className="flex flex-col gap-12">
      {/* ----------------------------------------------------------------
          Section 1: Smart insight narrative
          ---------------------------------------------------------------- */}
      <section aria-labelledby="narrative-heading">
        <h2 id="narrative-heading" className="sr-only">
          Footprint insight
        </h2>
        <InsightNarrative narrative={narrative} />
      </section>

      <DashboardSection id="overview-heading" title="Your numbers">
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard label="Annual footprint" value={formatCo2(result.totalKg)} icon="leaf" glow>
            <p className="text-sm text-ink-muted">
              Across transport, home energy, food, and shopping in {REGION_LABELS[input.region]}.
            </p>
          </StatCard>
          <ComparisonCard
            title="Vs. 1.5°C target"
            status={target.status}
            headline={targetHeadline}
            detail={`Your ${formatTonnes(result.totalTonnes)} compared with a ${formatTonnes(
              target.target,
            )} science-based personal target.`}
          />
          <ComparisonCard
            title={`Vs. ${REGION_LABELS[input.region]}`}
            status={average.status}
            headline={averageHeadline}
            detail={`The average person there emits about ${formatTonnes(
              average.average,
            )} per year.`}
          />
        </div>
      </DashboardSection>

      <DashboardSection id="breakdown-heading" title="Where it comes from">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-semibold text-ink">By category</h3>
            <CategoryBarChart breakdown={breakdown} />
          </Card>
          <Card>
            <h3 className="mb-4 font-semibold text-ink">Share of total</h3>
            <CategoryDonutChart breakdown={breakdown} />
          </Card>
        </div>
      </DashboardSection>

      <DashboardSection
        id="leaderboard-heading"
        title="Global comparison"
        badge={
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            26 countries
          </span>
        }
      >
        <Card className="p-5 sm:p-6">
          <CountryLeaderboard userTonnes={result.totalTonnes} />
        </Card>
      </DashboardSection>

      <DashboardSection
        id="challenge-heading"
        title="This week's challenge"
        badge={
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
            Rotates weekly
          </span>
        }
      >
        <WeeklyChallenges input={input} result={result} />
      </DashboardSection>

      <DashboardSection id="goal-heading" title="Reduction goal">
        <GoalTracker currentTonnes={result.totalTonnes} />
        {pledgeProgress && pledgeProgress.baselineTonnes > pledgeProgress.targetTonnes && (
          <Card className="mt-2">
            <h3 className="mb-5 font-display text-lg font-semibold text-ink">
              Pledge milestones
            </h3>
            <PledgeTimeline progress={pledgeProgress} />
          </Card>
        )}
      </DashboardSection>

      <DashboardSection id="tips-heading" title="Your highest-impact actions">
        {tips.length > 0 ? (
          <ol className="grid gap-3 md:grid-cols-2">
            {tips.map((tip, i) => (
              <TipCard key={tip.id} tip={tip} rank={i + 1} />
            ))}
          </ol>
        ) : (
          <Card className="flex items-center gap-3">
            <Icon name="check" size={22} className="text-primary" />
            <p className="text-ink-muted">
              Your profile is already very low-impact — there are no major reductions left to
              suggest.
            </p>
          </Card>
        )}
      </DashboardSection>

      <DashboardSection id="history-heading" title="Your progress over time">
        <Card>
          {history.length > 0 ? (
            <HistoryTrendChart history={history} />
          ) : (
            <p className="text-ink-muted">
              Recalculate periodically to build a trend line and watch your footprint change.
            </p>
          )}
        </Card>
      </DashboardSection>

      <DashboardSection id="badge-heading" title="Share your result">
        <Card className="p-5 sm:p-6">
          <CarbonBadge result={result} input={input} />
        </Card>
      </DashboardSection>

      {/* Update answers */}
      <div className="flex justify-center">
        <ButtonLink href="/calculator" variant="secondary" size="lg">
          <Icon name="arrow-left" size={18} />
          Update my answers
        </ButtonLink>
      </div>
    </div>
  );
}
