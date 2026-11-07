import { useState, useEffect } from 'react';

interface ThermometerVisualProps {
  currentAmount: number;
  targetAmount: number;
  className?: string;
}

export default function ThermometerVisual({
  currentAmount,
  targetAmount,
  className = ''
}: ThermometerVisualProps) {
  const safeTarget = targetAmount > 0 ? targetAmount : 800000;
  const safeCurrent = Math.max(0, currentAmount);

  // Smoothly animate displayAmount on mount or when safeCurrent updates
  const [animatedAmount, setAnimatedAmount] = useState(0);

  useEffect(() => {
    let animFrame: number;
    const startVal = animatedAmount;
    const endVal = safeCurrent;
    const duration = 1000; // 1 second smooth rise
    const startTime = performance.now();

    const updateLevel = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(startVal + (endVal - startVal) * ease);
      setAnimatedAmount(val);

      if (progress < 1) {
        animFrame = requestAnimationFrame(updateLevel);
      }
    };

    animFrame = requestAnimationFrame(updateLevel);
    return () => cancelAnimationFrame(animFrame);
  }, [safeCurrent]);

  const percentage = Math.min(100, Math.max(0, (animatedAmount / safeTarget) * 100));
  const finalPercentage = Math.min(100, Math.max(0, (safeCurrent / safeTarget) * 100));

  // Geometry dimensions in SVG canvas (viewBox="0 0 340 560")
  const tubeCenterX = 135;
  const tubeWidth = 38;
  const tubeRadius = tubeWidth / 2; // 19

  const tubeTopY = 70;
  const tubeStemBottomY = 440; // where stem meets bulb
  const stemHeight = tubeStemBottomY - (tubeTopY + 15); // ~355px

  const bulbCenterY = 485;
  const bulbRadius = 45;

  // Exact mercury surface Y coordinate based on current raised amount
  // 0% -> tubeStemBottomY (440)
  // 100% -> tubeTopY + 15 (85)
  const mercuryFillPx = (percentage / 100) * stemHeight;
  const mercuryLevelY = tubeStemBottomY - mercuryFillPx;
  const mercuryColumnHeight = bulbCenterY - mercuryLevelY; // extends into bulb center

  // Ruler tick amounts for an 800k goal (or proportional)
  const tickStep = safeTarget >= 500000 ? 100000 : Math.round(safeTarget / 8);
  const rulerTicks: { amount: number; isGoal?: boolean; isHalf?: boolean }[] = [];
  
  for (let amt = safeTarget; amt >= 0; amt -= tickStep) {
    rulerTicks.push({
      amount: amt,
      isGoal: amt === safeTarget,
      isHalf: amt === Math.round(safeTarget / 2)
    });
  }
  // Ensure target is explicitly in ticks
  if (!rulerTicks.some(t => t.amount === safeTarget)) {
    rulerTicks.unshift({ amount: safeTarget, isGoal: true });
  }

  function formatShortCurrency(val: number) {
    if (val >= 1000000) return `₱${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `₱${(val / 1000).toLocaleString()}K`;
    return `₱${val}`;
  }

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 350 560"
        className="w-full max-w-[300px] sm:max-w-[340px] h-auto drop-shadow-xl"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Mercury glow */}
          <filter id="mercury-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#dc2626" floodOpacity="0.4" />
          </filter>

          {/* Tube shadow */}
          <filter id="casing-shadow-filter" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>

          {/* Liquid gradient (Stem) */}
          <linearGradient id="mercury-stem-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#dc2626" />
            <stop offset="70%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* Bulb 3D radial shading */}
          <radialGradient id="bulb-fluid-gradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="45%" stopColor="#dc2626" />
            <stop offset="85%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>

          {/* Glass tube reflection sheen */}
          <linearGradient id="tube-glass-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* 1. RIGHT SIDE: RULER SCALE & CURRENCY MILESTONE TICKS     */}
        {/* ========================================================= */}
        {rulerTicks.map((tick, idx) => {
          const tickPct = tick.amount / safeTarget;
          const tickY = tubeStemBottomY - tickPct * stemHeight;
          const isCurrentZone = Math.abs(tick.amount - safeCurrent) < tickStep * 0.4;

          return (
            <g key={idx} className="transition-all duration-300">
              {/* Major Tick Mark */}
              <line
                x1={tubeCenterX + tubeRadius + 4}
                y1={tickY}
                x2={tubeCenterX + tubeRadius + (tick.isGoal ? 20 : tick.isHalf ? 16 : 12)}
                y2={tickY}
                stroke={tick.isGoal ? '#dc2626' : tick.isHalf ? '#475569' : '#94a3b8'}
                strokeWidth={tick.isGoal ? '3' : tick.isHalf ? '2.5' : '1.8'}
                strokeLinecap="round"
              />

              {/* Minor intermediate tick */}
              {idx < rulerTicks.length - 1 && (
                <line
                  x1={tubeCenterX + tubeRadius + 4}
                  y1={tickY + (stemHeight / (rulerTicks.length - 1)) / 2}
                  x2={tubeCenterX + tubeRadius + 9}
                  y2={tickY + (stemHeight / (rulerTicks.length - 1)) / 2}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              )}

              {/* Amount Label */}
              <text
                x={tubeCenterX + tubeRadius + 24}
                y={tickY + 4}
                fill={tick.isGoal ? '#dc2626' : isCurrentZone ? '#0f172a' : '#334155'}
                fontSize={tick.isGoal ? '14' : tick.isHalf ? '12' : '11'}
                fontWeight={tick.isGoal ? '900' : tick.isHalf ? '800' : '700'}
                fontFamily="system-ui, -apple-system, sans-serif"
                className="tracking-tight"
              >
                {tick.isGoal ? `₱${tick.amount.toLocaleString()} (GOAL)` : formatShortCurrency(tick.amount)}
              </text>
            </g>
          );
        })}

        {/* ========================================================= */}
        {/* 2. THERMOMETER CASING (Back Glass & Housing)              */}
        {/* ========================================================= */}
        <g filter="url(#casing-shadow-filter)">
          {/* Bulb background housing */}
          <circle
            cx={tubeCenterX}
            cy={bulbCenterY}
            r={bulbRadius + 7}
            fill="#ffffff"
          />
          {/* Tube background housing */}
          <rect
            x={tubeCenterX - tubeRadius - 7}
            y={tubeTopY - 7}
            width={tubeWidth + 14}
            height={tubeStemBottomY - tubeTopY + 16}
            rx={tubeRadius + 7}
            fill="#ffffff"
          />

          {/* Outer stroke line */}
          <circle
            cx={tubeCenterX}
            cy={bulbCenterY}
            r={bulbRadius + 7}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          <rect
            x={tubeCenterX - tubeRadius - 7}
            y={tubeTopY - 7}
            width={tubeWidth + 14}
            height={tubeStemBottomY - tubeTopY + 16}
            rx={tubeRadius + 7}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
        </g>

        {/* Tube Inner Hollow Channel (Light grey glass background) */}
        <rect
          x={tubeCenterX - tubeRadius}
          y={tubeTopY}
          width={tubeWidth}
          height={tubeStemBottomY - tubeTopY + 15}
          rx={tubeRadius}
          fill="#f1f5f9"
        />

        {/* ========================================================= */}
        {/* 3. ACTIVE RED MERCURY FLUID                               */}
        {/* ========================================================= */}
        
        {/* Mercury Column inside the stem (From mercuryLevelY down to bulb) */}
        <rect
          x={tubeCenterX - tubeRadius + 4}
          y={mercuryLevelY}
          width={tubeWidth - 8}
          height={Math.max(1, mercuryColumnHeight)}
          rx={(tubeWidth - 8) / 2}
          fill="url(#mercury-stem-gradient)"
          filter="url(#mercury-glow-filter)"
        />

        {/* Bulb Liquid (Circular reservoir) */}
        <circle
          cx={tubeCenterX}
          cy={bulbCenterY}
          r={bulbRadius - 1}
          fill="url(#bulb-fluid-gradient)"
          filter="url(#mercury-glow-filter)"
        />

        {/* Liquid Surface Meniscus Highlight at mercuryLevelY */}
        {percentage > 0 && (
          <g>
            {/* Curved meniscus dome */}
            <ellipse
              cx={tubeCenterX}
              cy={mercuryLevelY + 2}
              rx={(tubeWidth - 8) / 2}
              ry="4"
              fill="#fca5a5"
            />
            {/* Specular center highlight */}
            <ellipse
              cx={tubeCenterX}
              cy={mercuryLevelY + 1.5}
              rx={(tubeWidth - 14) / 2}
              ry="2"
              fill="#ffffff"
              opacity="0.8"
            />
          </g>
        )}

        {/* Bulb glossy highlight reflection (3D effect) */}
        <ellipse
          cx={tubeCenterX - 14}
          cy={bulbCenterY - 14}
          rx="15"
          ry="11"
          fill="#ffffff"
          opacity="0.4"
        />

        {/* Tube Front Glass Reflection Sheen */}
        <rect
          x={tubeCenterX - tubeRadius + 3}
          y={tubeTopY + 3}
          width={8}
          height={tubeStemBottomY - tubeTopY + 6}
          rx="4"
          fill="url(#tube-glass-sheen)"
          opacity="0.75"
        />

        {/* ========================================================= */}
        {/* 4. CURRENT RAISED AMOUNT INDICATOR & POINTER              */}
        {/* ========================================================= */}
        
        {/* Horizontal indicator line connecting mercury level to badge */}
        <line
          x1="102"
          y1={mercuryLevelY}
          x2={tubeCenterX - tubeRadius + 4}
          y2={mercuryLevelY}
          stroke="#dc2626"
          strokeWidth="2.5"
          strokeDasharray="3 2"
        />

        {/* Red Arrow pointing precisely to the mercury level */}
        <polygon
          points={`
            ${tubeCenterX - tubeRadius + 2},${mercuryLevelY}
            ${tubeCenterX - tubeRadius - 7},${mercuryLevelY - 5}
            ${tubeCenterX - tubeRadius - 7},${mercuryLevelY + 5}
          `}
          fill="#dc2626"
        />

        {/* Current Offering Callout Card on the left */}
        <g className="transition-all duration-300">
          {/* Card background */}
          <rect
            x="8"
            y={mercuryLevelY - 20}
            width="96"
            height="40"
            rx="10"
            fill="#0f172a"
            filter="url(#casing-shadow-filter)"
          />
          {/* Red top border accent */}
          <rect
            x="8"
            y={mercuryLevelY - 20}
            width="96"
            height="3"
            rx="1.5"
            fill="#dc2626"
          />

          {/* Subtitle: e.g. "18.8% RAISED" */}
          <text
            x="56"
            y={mercuryLevelY - 5}
            textAnchor="middle"
            fill="#f87171"
            fontSize="9"
            fontWeight="800"
            letterSpacing="0.4"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {finalPercentage.toFixed(1)}% RAISED
          </text>

          {/* Main Figure: e.g. "₱150,000" */}
          <text
            x="56"
            y={mercuryLevelY + 11}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="12"
            fontWeight="900"
            letterSpacing="-0.2"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            ₱{animatedAmount.toLocaleString()}
          </text>
        </g>
      </svg>
    </div>
  );
}
