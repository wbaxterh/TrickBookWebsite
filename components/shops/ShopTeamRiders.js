import { Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';

/**
 * Extracts an internal TrickBook rider slug from a rider object.
 * Priority: explicit riderSlug/slug > same-site profileUrl > null
 */
function getInternalRiderSlug(rider) {
  if (rider.riderSlug) return rider.riderSlug;
  if (rider.slug) return rider.slug;

  const profileUrl = rider.profileUrl;
  if (!profileUrl) return null;

  if (profileUrl.startsWith('/riders/')) {
    return profileUrl.slice('/riders/'.length).split('?')[0];
  }

  try {
    const url = new URL(profileUrl);
    if (
      (url.hostname === 'thetrickbook.com' || url.hostname === 'www.thetrickbook.com') &&
      url.pathname.startsWith('/riders/')
    ) {
      return url.pathname.slice('/riders/'.length).split('?')[0];
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

const pillBaseClass =
  'inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground';
const pillInteractiveClass =
  'no-underline transition-colors hover:bg-yellow-500/20 hover:text-yellow-700 dark:hover:text-yellow-300';

function RiderPillContent({ rider }) {
  return (
    <>
      {rider.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={rider.imageUrl} alt={rider.name} className="h-6 w-6 rounded-full object-cover" />
      )}
      <span>{rider.name}</span>
    </>
  );
}

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
                  const internalSlug = getInternalRiderSlug(rider);

                  if (internalSlug) {
                    return (
                      <Link
                        key={`${rider.name}-${idx}`}
                        href={`/riders/${internalSlug}`}
                        className={`${pillBaseClass} ${pillInteractiveClass}`}
                      >
                        <RiderPillContent rider={rider} />
                      </Link>
                    );
                  }

                  return (
                    <span key={`${rider.name}-${idx}`} className={pillBaseClass}>
                      <RiderPillContent rider={rider} />
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
