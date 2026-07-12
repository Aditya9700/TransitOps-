import React from 'react';

interface SafetyScoreBadgeProps {
  score: number;
}

export const SafetyScoreBadge: React.FC<SafetyScoreBadgeProps> = ({ score }) => {
  let badgeStyles = '';
  let dotStyles = '';

  if (score >= 95) {
    // 95-100: Green
    badgeStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    dotStyles = 'bg-emerald-500';
  } else if (score >= 80) {
    // 80-94: Blue
    badgeStyles = 'bg-blue-50 text-blue-700 border border-blue-200';
    dotStyles = 'bg-blue-500';
  } else if (score >= 60) {
    // 60-79: Amber
    badgeStyles = 'bg-amber-50 text-amber-700 border border-amber-200';
    dotStyles = 'bg-amber-500';
  } else {
    // Below 60: Red
    badgeStyles = 'bg-red-50 text-red-700 border border-red-200';
    dotStyles = 'bg-red-500';
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles}`} />
      <span>{score}</span>
    </span>
  );
};
