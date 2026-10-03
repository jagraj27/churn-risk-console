import type { RiskTier } from "../types/customer";

interface RiskBadgeProps {
  tier: RiskTier;
  score: number;
}

export default function RiskBadge({ tier, score }: RiskBadgeProps) {
  return (
    <span className={`risk-badge risk-${tier.toLowerCase()}`}>
      {tier} · {score}
    </span>
  );
}
