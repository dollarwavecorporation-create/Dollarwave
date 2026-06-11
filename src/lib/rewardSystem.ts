export type UserLevel = 1 | 2 | 3 | 4 | 5;

type ReferralRewardTierRow = {
  investment: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
};

export const LEVEL_PERCENTAGE_BY_LEVEL: Record<UserLevel, number> = {
  1: 1.5,
  2: 2.0,
  3: 2.5,
  4: 3.0,
  5: 3.5,
};

export const LEVEL_REQUIREMENTS: Record<UserLevel, { minBalance: number; minReferrals: number }> = {
  1: { minBalance: 0, minReferrals: 0 },
  2: { minBalance: 500, minReferrals: 8 },
  3: { minBalance: 1000, minReferrals: 25 },
  4: { minBalance: 2500, minReferrals: 50 },
  5: { minBalance: 5000, minReferrals: 120 },
};

export const DEPOSIT_FIXED_AMOUNTS = [ 60, 100, 250, 500, 1000, 2500, 5000] as const;

export const REFERRAL_REWARD_TABLE: ReferralRewardTierRow[] = [
  { investment: 100, level1: 8, level2: 10, level3: 12, level4: 15, level5: 18 },
  { investment: 150, level1: 15, level2: 18, level3: 20, level4: 22, level5: 25 },
  { investment: 250, level1: 25, level2: 30, level3: 35, level4: 40, level5: 45 },
  { investment: 500, level1: 50, level2: 60, level3: 70, level4: 80, level5: 90 },
  { investment: 1000, level1: 100, level2: 120, level3: 140, level4: 160, level5: 180 },
  { investment: 2500, level1: 250, level2: 300, level3: 350, level4: 400, level5: 450 },
  { investment: 5000, level1: 500, level2: 600, level3: 700, level4: 800, level5: 900 },
];

export const getLevelFromProgress = (balance: number, referralCount: number): UserLevel => {
  if (balance >= 5000 && referralCount >= 120) return 5;
  if (balance >= 2500 && referralCount >= 50) return 4;
  if (balance >= 1000 && referralCount >= 25) return 3;
  if (balance >= 500 && referralCount >= 8) return 2;
  return 1;
};

export const getLevelFromBalance = (balance: number): UserLevel => {
  if (balance >= 5000) return 5;
  if (balance >= 2500) return 4;
  if (balance >= 1000) return 3;
  if (balance >= 500) return 2;
  return 1;
};

export const getLevelBalanceRangeLabel = (level: UserLevel): string => {
  switch (level) {
    case 1:
      return "$0 - $499";
    case 2:
      return "$500 - $999";
    case 3:
      return "$1,000 - $2,499";
    case 4:
      return "$2,500 - $4,999";
    case 5:
      return "$5,000+";
    default:
      return "$0 - $499";
  }
};

export const getMiningRewardsFromBalance = (balance: number, level: UserLevel) => {
  const rate = LEVEL_PERCENTAGE_BY_LEVEL[level];
  const safeBalance = Math.max(balance, 0);
  const daily = Number(((safeBalance * rate) / 100).toFixed(6));
  const perMine = Number((daily / 24).toFixed(6));
  return { rate, daily, perMine };
};

const getLevelColumnValue = (row: ReferralRewardTierRow, level: UserLevel): number => {
  switch (level) {
    case 1:
      return row.level1;
    case 2:
      return row.level2;
    case 3:
      return row.level3;
    case 4:
      return row.level4;
    case 5:
      return row.level5;
    default:
      return row.level1;
  }
};

export const getReferralAwardForDeposit = (depositAmount: number, level: UserLevel): number => {
  let tier: ReferralRewardTierRow | null = null;
  for (const row of REFERRAL_REWARD_TABLE) {
    if (depositAmount >= row.investment) {
      tier = row;
    } else {
      break;
    }
  }

  if (!tier) return 0;
  return getLevelColumnValue(tier, level);
};
