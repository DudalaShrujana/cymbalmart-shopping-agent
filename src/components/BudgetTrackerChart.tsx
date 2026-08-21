import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { ShoppingItem, EventDetails, CategoryId } from '../types';

interface BudgetTrackerChartProps {
  items: ShoppingItem[];
  eventDetails: EventDetails;
  onOptimizeBudget?: (mode: 'reduce_cost' | 'upgrade_premium' | 'exact_match') => Promise<void>;
  isOptimizing?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      fill?: string;
      description?: string;
      category?: string;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 rounded-2xl shadow-xl border border-[#E8E6E1] text-xs space-y-1">
        <div className="font-bold text-[#2D332A] flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.fill || '#7C8B71' }}
          />
          <span>{data.payload.name}</span>
        </div>
        <div className="font-mono text-sm font-bold text-[#2D332A]">
          ${Number(data.value).toFixed(2)}
        </div>
        {data.payload.description && (
          <div className="text-[11px] text-[#8B8881]">{data.payload.description}</div>
        )}
      </div>
    );
  }
  return null;
};

export const BudgetTrackerChart: React.FC<BudgetTrackerChartProps> = ({
  items,
  eventDetails,
  onOptimizeBudget,
  isOptimizing = false,
}) => {
  const [chartView, setChartView] = useState<'comparison' | 'category'>('comparison');

  const activeItems = items.filter((i) => !i.alreadyHave);
  const cartTotal = activeItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const targetBudget = eventDetails.budget || 150;
  const budgetDelta = targetBudget - cartTotal;
  const isOverBudget = budgetDelta < 0;
  const overageAmount = Math.abs(budgetDelta);
  const percentSpent = targetBudget > 0 ? Math.round((cartTotal / targetBudget) * 100) : 0;

  // Category totals
  const categoryTotals: Record<CategoryId, number> = {
    food_drinks: 0,
    tableware: 0,
    decor: 0,
    entertainment_favors: 0,
  };

  activeItems.forEach((item) => {
    if (categoryTotals[item.category] !== undefined) {
      categoryTotals[item.category] += item.unitPrice * item.quantity;
    }
  });

  // Comparison Bar Chart Data
  const comparisonData = [
    {
      name: "User Budget",
      amount: Number(targetBudget.toFixed(2)),
      fill: "#2D332A",
      description: `Target budget set for ${eventDetails.guestCount} guests`,
    },
    {
      name: "Estimated Total",
      amount: Number(cartTotal.toFixed(2)),
      fill: isOverBudget ? "#DC2626" : "#7C8B71",
      description: isOverBudget
        ? `Exceeds budget by $${overageAmount.toFixed(2)} (${percentSpent}%)`
        : `Within budget (${percentSpent}% utilized)`,
    },
  ];

  // Category Breakdown Bar Chart Data
  const categoryData = [
    {
      name: "Food & Drinks",
      amount: Number(categoryTotals.food_drinks.toFixed(2)),
      fill: "#7C8B71",
      description: `${categoryTotals.food_drinks > 0 && cartTotal > 0 ? Math.round((categoryTotals.food_drinks / cartTotal) * 100) : 0}% of cart total`,
    },
    {
      name: "Tableware",
      amount: Number(categoryTotals.tableware.toFixed(2)),
      fill: "#A87B4F",
      description: `${categoryTotals.tableware > 0 && cartTotal > 0 ? Math.round((categoryTotals.tableware / cartTotal) * 100) : 0}% of cart total`,
    },
    {
      name: "Decor",
      amount: Number(categoryTotals.decor.toFixed(2)),
      fill: "#8C6B7E",
      description: `${categoryTotals.decor > 0 && cartTotal > 0 ? Math.round((categoryTotals.decor / cartTotal) * 100) : 0}% of cart total`,
    },
    {
      name: "Games & Favors",
      amount: Number(categoryTotals.entertainment_favors.toFixed(2)),
      fill: "#6A8B88",
      description: `${categoryTotals.entertainment_favors > 0 && cartTotal > 0 ? Math.round((categoryTotals.entertainment_favors / cartTotal) * 100) : 0}% of cart total`,
    },
  ];

  const yMax = Math.max(targetBudget, cartTotal, 50) * 1.25;

  return (
    <div
      id="visual-budget-tracker"
      className={`rounded-3xl border transition-all duration-200 p-5 sm:p-6 mb-6 ${
        isOverBudget
          ? 'bg-rose-50/50 border-rose-200 shadow-xs'
          : 'bg-white border-[#E8E6E1] shadow-xs'
      }`}
    >
      {/* Alert Banner / Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6E1]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`p-1.5 rounded-lg flex items-center justify-center ${
                isOverBudget
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-[#7C8B71]/15 text-[#5A6354]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-serif font-semibold text-[#2D332A]">
              Visual Budget Tracker
            </h3>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                isOverBudget
                  ? 'bg-rose-100 border-rose-300 text-rose-800 animate-pulse'
                  : 'bg-[#7C8B71]/15 border-[#7C8B71]/30 text-[#2D332A]'
              }`}
            >
              {isOverBudget ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Budget Exceeded</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-[#7C8B71]" />
                  <span>On Budget</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-[#8B8881]">
            Real-time visual comparison of your estimated party total vs. target budget
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 bg-[#F3F2EE] p-1 rounded-full border border-[#E8E6E1] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartView('comparison')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
              chartView === 'comparison'
                ? 'bg-white text-[#2D332A] shadow-xs'
                : 'text-[#8B8881] hover:text-[#2D332A]'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Budget vs. Total</span>
          </button>
          <button
            type="button"
            onClick={() => setChartView('category')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition flex items-center gap-1.5 ${
              chartView === 'category'
                ? 'bg-white text-[#2D332A] shadow-xs'
                : 'text-[#8B8881] hover:text-[#2D332A]'
            }`}
          >
            <PieChart className="w-3 h-3" />
            <span>Aisle Breakdown</span>
          </button>
        </div>
      </div>

      {/* Color-Coded Alert Callout */}
      <div
        className={`my-4 p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isOverBudget
            ? 'bg-rose-100/70 border-rose-300 text-rose-900'
            : 'bg-[#FAF9F6] border-[#E8E6E1] text-[#2D332A]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2.5">
          {isOverBudget ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#7C8B71] shrink-0 mt-0.5 sm:mt-0" />
          )}
          <div>
            {isOverBudget ? (
              <div>
                <strong className="font-bold text-rose-800">
                  Budget Alert: Current total (${cartTotal.toFixed(2)}) exceeds your $
                  {targetBudget.toFixed(2)} budget by ${overageAmount.toFixed(2)}!
                </strong>
                <div className="text-[11px] text-rose-700 mt-0.5">
                  Adjust item quantities below, mark items you already have at home, or use the AI Smart Budget Balancer.
                </div>
              </div>
            ) : (
              <div>
                <strong className="font-bold text-[#2D332A]">
                  Budget On Track: ${cartTotal.toFixed(2)} estimated total of ${targetBudget.toFixed(2)} budget.
                </strong>
                <div className="text-[11px] text-[#5A6354] mt-0.5">
                  You have <strong className="font-mono">${budgetDelta.toFixed(2)}</strong> remaining room in your budget (~${(cartTotal / Math.max(1, eventDetails.guestCount)).toFixed(2)} per guest).
                </div>
              </div>
            )}
          </div>
        </div>

        {isOverBudget && onOptimizeBudget && (
          <button
            onClick={() => onOptimizeBudget('reduce_cost')}
            disabled={isOptimizing}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-full font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>{isOptimizing ? 'Balancing...' : 'Auto-Fix Over Budget'}</span>
          </button>
        )}
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartView === 'comparison' ? (
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#5A6354', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#E8E6E1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: '#8B8881', fontSize: 11 }}
                axisLine={{ stroke: '#E8E6E1' }}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={targetBudget}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{
                  value: `Budget Ceiling: $${targetBudget.toFixed(0)}`,
                  fill: '#DC2626',
                  fontSize: 11,
                  position: 'top',
                  fontWeight: 600,
                }}
              />
              <Bar
                dataKey="amount"
                name="Amount ($)"
                radius={[8, 8, 0, 0]}
                barSize={56}
                animationDuration={600}
              >
                {comparisonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke={index === 1 && isOverBudget ? '#B91C1C' : undefined}
                    strokeWidth={index === 1 && isOverBudget ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={categoryData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E1" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#5A6354', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#E8E6E1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8B8881', fontSize: 11 }}
                axisLine={{ stroke: '#E8E6E1' }}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                name="Category Spend ($)"
                radius={[8, 8, 0, 0]}
                barSize={44}
                animationDuration={600}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cat-cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary KPI Footnotes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E8E6E1] text-xs">
        <div className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1]">
          <div className="text-[10px] uppercase font-bold text-[#8B8881]">Target Budget</div>
          <div className="font-bold font-mono text-sm text-[#2D332A] mt-0.5">
            ${targetBudget.toFixed(2)}
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1]">
          <div className="text-[10px] uppercase font-bold text-[#8B8881]">Current Total</div>
          <div
            className={`font-bold font-mono text-sm mt-0.5 ${
              isOverBudget ? 'text-rose-600 font-extrabold' : 'text-[#2D332A]'
            }`}
          >
            ${cartTotal.toFixed(2)}
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1]">
          <div className="text-[10px] uppercase font-bold text-[#8B8881]">Difference</div>
          <div
            className={`font-bold font-mono text-sm mt-0.5 flex items-center gap-1 ${
              isOverBudget ? 'text-rose-600' : 'text-[#5A6354]'
            }`}
          >
            {isOverBudget ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+${overageAmount.toFixed(2)}</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                <span>-${budgetDelta.toFixed(2)}</span>
              </>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#FAF9F6] border border-[#E8E6E1]">
          <div className="text-[10px] uppercase font-bold text-[#8B8881]">Budget Utilized</div>
          <div
            className={`font-bold font-mono text-sm mt-0.5 ${
              isOverBudget ? 'text-rose-600' : 'text-[#2D332A]'
            }`}
          >
            {percentSpent}%
          </div>
        </div>
      </div>
    </div>
  );
};
