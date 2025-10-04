import { format } from "date-fns";
import { Clock } from "lucide-react";

interface TimeSlotPickerProps {
  timeSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  selectedDate: string;
}

export const TimeSlotPicker = ({ timeSlots, selectedTime, onSelectTime, selectedDate }: TimeSlotPickerProps) => {
  if (timeSlots.length === 0) {
    return (
      <div className="glass rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-high">Available Times</h3>
        <p className="text-mid text-center py-8">
          No available time slots for this date. Please select another date or use the request form below.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-high">
        Available Times for {format(new Date(selectedDate), 'MMMM d, yyyy')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {timeSlots.map((timeSlot) => {
          const time = new Date(timeSlot);
          const isSelected = selectedTime === timeSlot;
          
          return (
            <button
              key={timeSlot}
              onClick={() => onSelectTime(timeSlot)}
              className={`
                p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105
                ${isSelected 
                  ? 'border-primary bg-primary/20 shadow-[0_0_20px_rgba(0,229,212,0.3)]' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-mid'}`} />
                <span className={`font-medium ${isSelected ? 'text-primary' : 'text-high'}`}>
                  {format(time, 'h:mm a')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-mid mt-4 text-center">
        Times shown in your local timezone
      </p>
    </div>
  );
};
