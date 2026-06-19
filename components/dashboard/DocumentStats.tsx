import {
  StatCardGrid,
  type StatCardItem,
} from "@/components/workspace/StatCardGrid";

export type { StatCardItem };

type DocumentStatsProps = {
  stats: StatCardItem[];
};

export function DocumentStats({ stats }: DocumentStatsProps) {
  return <StatCardGrid stats={stats} />;
}
