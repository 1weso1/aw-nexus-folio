import { format, addDays, startOfDay, isSameDay } from "date-fns";

interface CalendarGridProps {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export const CalendarGrid = ({ availableDates, selectedDate, onSelectDate }: CalendarGridProps) => {
  const today = startOfDay(new Date());
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const isDateAvailable = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return availableDates.includes(dateKey);
  };

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-high">Select a Date</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {dates.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const isAvailable = isDateAvailable(date);
          const isSelected = selectedDate === dateKey;
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={dateKey}
              onClick={() => isAvailable && onSelectDate(dateKey)}
              disabled={!isAvailable}
              className={`
                p-4 rounded-lg border-2 transition-all duration-300
                ${isAvailable ? 'cursor-pointer hover:scale-105' : 'opacity-50 cursor-not-allowed'}
                ${isSelected 
                  ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(0,229,212,0.3)]' 
                  : isAvailable 
                    ? 'border-border hover:border-primary/50' 
                    : 'border-border/30'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs text-mid uppercase">
                  {format(date, 'EEE')}
                </span>
                <span className={`text-2xl font-bold ${isSelected ? 'text-primary' : 'text-high'}`}>
                  {format(date, 'd')}
                </span>
                <span className="text-xs text-mid">
                  {format(date, 'MMM')}
                </span>
                {isToday && (
                  <span className="text-[10px] text-primary mt-1">Today</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
