import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
};

const SOCIAL_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function ShopSocialLinks({ socialLinks }) {
  if (!socialLinks || !Object.keys(socialLinks).length) return null;

  const links = Object.entries(socialLinks).filter(([, url]) => url);

  if (!links.length) return null;

  return (
    <div className="flex items-center gap-2">
      {links.map(([platform, url]) => {
        const Icon = platform === 'tiktok' ? TikTokIcon : SOCIAL_ICONS[platform];
        const label = SOCIAL_LABELS[platform] || platform;

        if (!Icon && platform !== 'tiktok') {
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground no-underline transition-colors hover:border-yellow-500 hover:text-yellow-500"
              aria-label={label}
            >
              {label}
            </a>
          );
        }

        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-yellow-500 hover:text-yellow-500"
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
