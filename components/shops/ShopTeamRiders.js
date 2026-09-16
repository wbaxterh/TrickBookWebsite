import { ExternalLink, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function ShopTeamRiders({ teamRiders }) {
  if (!teamRiders?.length) return null;

  const groupedByRole = teamRiders.reduce((acc, rider) => {
    const role = rider.role || 'Team';
    if (!acc[role]) acc[role] = [];
    acc[role].push(rider);
    return acc;
  }, {});

  const roleGroups = Object.entries(groupedByRole);

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground">Team & Sponsored Riders</h2>
        </div>
        <div className="mt-4 space-y-4">
          {roleGroups.map(([role, riders]) => (
            <div key={role}>
              {roleGroups.length > 1 && (
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{role}</h3>
              )}
              <div className="flex flex-wrap gap-2">
                {riders.map((rider, idx) => {
                  const linkUrl = rider.profileUrl || rider.sourceUrl;
                  const content = (
                    <>
                      {rider.imageUrl && (
                        <img
                          src={rider.imageUrl}
                          alt={rider.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      <span>{rider.name}</span>
                      {linkUrl && <ExternalLink className="h-3 w-3 opacity-60" />}
                    </>
                  );

                  return linkUrl ? (
                    <a
                      key={`${rider.name}-${idx}`}
                      href={linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground no-underline transition-colors hover:bg-yellow-500/20 hover:text-yellow-700 dark:hover:text-yellow-300"
                    >
                      {content}
                    </a>
                  ) : (
                    <span
                      key={`${rider.name}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground"
                    >
                      {content}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
