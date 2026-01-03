import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Doodle } from '@/types';

interface ActivityHeatmapProps {
  doodles: Doodle[];
  className?: string;
}

export function ActivityHeatmap({ doodles, className }: ActivityHeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1); // Jan 1 of current year

    // Create a map of dates to doodle counts
    const activityMap = new Map<string, number>();
    doodles.forEach((doodle) => {
      const date = doodle.created_at.split('T')[0]; // YYYY-MM-DD
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    // Generate all days from start of year to today
    const days: { date: string; count: number; dayOfWeek: number }[] = [];
    const current = new Date(startDate);
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }

    // Group by weeks for grid display
    const weeksArray: (typeof days)[] = [];
    let currentWeek: typeof days = [];

    // Pad first week with empty days
    const firstDayOfWeek = days[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: '', count: -1, dayOfWeek: i });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) weeksArray.push(currentWeek);

    // Generate month labels with their positions
    const months: { label: string; weekIndex: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    weeksArray.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.date !== '');
      if (firstValidDay) {
        const month = new Date(firstValidDay.date).getMonth();
        if (month !== lastMonth) {
          months.push({ label: monthNames[month], weekIndex });
          lastMonth = month;
        }
      }
    });

    return { weeks: weeksArray, monthLabels: months };
  }, [doodles]);

  const getColor = (count: number) => {
    if (count < 0) return 'bg-transparent';
    if (count === 0) return 'bg-muted';
    if (count === 1) return 'bg-primary/30';
    if (count === 2) return 'bg-primary/50';
    if (count >= 3) return 'bg-primary';
    return 'bg-muted';
  };

  const totalDoodles = doodles.length;
  const activeDays = new Set(doodles.map((d) => d.created_at.split('T')[0])).size;

  return (
    <div className={cn('', className)}>
      {/* Month labels */}
      <div className="flex gap-1 mb-1 ml-0 text-xs text-muted-foreground overflow-x-auto">
        <div className="min-w-max flex gap-1">
          {monthLabels.map((month, idx) => (
            <div
              key={idx}
              className="text-center"
              style={{
                marginLeft: idx === 0 ? 0 : `${(month.weekIndex - (monthLabels[idx - 1]?.weekIndex || 0) - 1) * 13}px`,
                minWidth: '24px',
              }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={cn('w-3 h-3 rounded-sm transition-colors', getColor(day.count))}
                  title={day.date ? `${day.date}: ${day.count} doodle${day.count !== 1 ? 's' : ''}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend and summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{totalDoodles}</span> doodles on{' '}
          <span className="font-medium text-foreground">{activeDays}</span> days this year
        </div>
      </div>
    </div>
  );
}
