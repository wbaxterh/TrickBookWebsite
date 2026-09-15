import { ArrowRight, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { trackEventConversion } from '../../lib/analytics';
import { getPrimarySport, getSportMeta } from '../../lib/eventFormatters';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const COPY = {
  skateboarding: 'Build your skate trick list and track every new make.',
  snowboarding: 'Track your snowboard progression from first turns to new tricks.',
  skiing: 'Build your freeski trick list and keep your progression moving.',
  bmx: 'Track the BMX tricks you are learning and the ones you have landed.',
  mtb: 'Track your mountain-bike skills and progression between events.',
  scooter: 'Build your scooter trick list and log every new make.',
  rollerblading: 'Track your rollerblading tricks and progression session by session.',
  surfing: 'Track your surf progression and the skills you are building.',
  wakeboarding: 'Build your wakeboarding trick list and log your progression.',
};

export default function EventConversionCta({ event }) {
  const { loggedIn } = useContext(AuthContext);
  const sportId = getPrimarySport(event);
  const sport = getSportMeta(sportId);
  const destination = loggedIn
    ? '/trickbook'
    : `/signup?source=event&event=${encodeURIComponent(event.slug)}`;

  return (
    <Card className="overflow-hidden border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 via-card to-card">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400">
              Keep progressing after the event
            </p>
            <h2 className="mt-2 text-2xl font-black text-foreground">
              Your {sport.label.toLowerCase()} progression belongs in TrickBook
            </h2>
            <p className="mt-3 text-muted-foreground">
              {COPY[sportId] ||
                'Build your trick list, track your progress, and keep your next goal in sight.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
            <Button asChild className="bg-yellow-400 font-bold text-black hover:bg-yellow-300">
              <Link
                href={destination}
                onClick={() => trackEventConversion(event, loggedIn ? 'open_trickbook' : 'signup')}
              >
                {loggedIn ? 'Open my TrickBook' : 'Join TrickBook'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href="https://apps.apple.com/us/app/the-trick-book/id6446022788"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEventConversion(event, 'app_store')}
              >
                <Smartphone className="mr-2 h-4 w-4" /> App Store
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
