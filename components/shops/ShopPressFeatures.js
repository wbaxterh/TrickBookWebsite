import { ExternalLink, Newspaper } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function ShopPressFeatures({ pressFeatures }) {
  if (!pressFeatures?.length) return null;

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground">In the Press</h2>
        </div>
        <div className="mt-4 space-y-4">
          {pressFeatures.map((item, idx) => {
            const publishedDate = item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : null;

            return (
              <a
                key={item.url || idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-lg border border-border p-4 no-underline transition-colors hover:border-yellow-500 hover:bg-yellow-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-yellow-500">
                    {item.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{item.publisher}</span>
                  {publishedDate && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{publishedDate}</span>
                    </>
                  )}
                </div>
                {item.summary && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
