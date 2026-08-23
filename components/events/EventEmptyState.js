import { BellPlus, CalendarSearch } from 'lucide-react';
import { Button } from '../ui/button';

export default function EventEmptyState({ filtered = false, onReset }) {
  return (
    <div className="border border-dashed border-border rounded-2xl p-10 sm:p-16 text-center bg-card/50">
      <div className="h-14 w-14 rounded-full bg-yellow-400/15 mx-auto flex items-center justify-center">
        <CalendarSearch className="h-7 w-7 text-yellow-500" />
      </div>
      <h2 className="text-xl font-bold text-foreground mt-5">
        {filtered ? 'No events match these filters' : 'The event hose is warming up'}
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto mt-2">
        {filtered
          ? 'Try a wider distance, another date, or all sports.'
          : 'We are connecting official calendars and registration sources. Soon you will be able to find competitions, sessions, and livestreams here.'}
      </p>
      <div className="flex items-center justify-center gap-2 mt-6">
        {filtered ? (
          <Button onClick={onReset} className="bg-yellow-400 text-black hover:bg-yellow-300">
            Clear filters
          </Button>
        ) : (
          <Button disabled variant="outline">
            <BellPlus className="h-4 w-4 mr-2" /> Event alerts coming soon
          </Button>
        )}
      </div>
    </div>
  );
}
