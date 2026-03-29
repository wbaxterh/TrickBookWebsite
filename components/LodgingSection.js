import { Bed, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const TYPE_COLORS = {
  hotel: 'bg-blue-500/20 text-blue-400',
  lodge: 'bg-amber-500/20 text-amber-400',
  hostel: 'bg-green-500/20 text-green-400',
  resort: 'bg-purple-500/20 text-purple-400',
  cabin: 'bg-orange-500/20 text-orange-400',
  condo: 'bg-cyan-500/20 text-cyan-400',
  vacation_rental: 'bg-pink-500/20 text-pink-400',
  motel: 'bg-slate-500/20 text-slate-400',
};

export default function LodgingSection({ lodging }) {
  if (!lodging?.length) return null;

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Bed className="h-5 w-5 text-yellow-500" />
            Where to Stay
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lodging.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  {item.type && (
                    <Badge
                      variant="secondary"
                      className={`text-xs shrink-0 ${TYPE_COLORS[item.type] || 'bg-gray-500/20 text-gray-400'}`}
                    >
                      {item.type.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 flex-1">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {item.priceRange && (
                    <span className="text-sm font-medium text-yellow-500">{item.priceRange}</span>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
