import React from 'react';
import PropTypes from 'prop-types';

export default function StatCard({ label, value, subtext, icon, trend }) {
  return (
    <div className="bg-[#1a1a1a] border border-white/6 hover:border-orange-500/20 transition-colors rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-xs uppercase">{label}</p>
        {icon && <div className="text-orange-400">{icon}</div>}
      </div>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
      {subtext && <p className="text-zinc-600 text-xs mt-1">{subtext}</p>}
      {trend && (
        <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? `↑ ${trend}%` : `↓ ${Math.abs(trend)}%`}
        </p>
      )}
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.node,
  trend: PropTypes.number
};
