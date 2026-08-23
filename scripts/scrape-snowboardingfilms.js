#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SOURCE_ROOT = 'https://www.snowboardingfilms.net';
const CHROME_PATH =
  process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function arg(name, fallback) {
  const item = process.argv.find((value) => value.startsWith(`--${name}=`));
  return item ? item.slice(name.length + 3) : fallback;
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function samePublisher(producer, channel) {
  const normalize = (value) => slugify(value).replace(/snowboards?|films?|official|tv/g, '');
  const a = normalize(producer);
  const b = normalize(channel);
  return a.length >= 2 && b.length >= 2 && (a.includes(b) || b.includes(a));
}

async function youtubeMetadata(videoId, producer) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
  );
  const oembed = response.ok ? await response.json() : {};
  const maxres = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const maxresResponse = await fetch(maxres, { method: 'HEAD' });
  const poster = maxresResponse.ok ? maxres : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    platform: 'youtube',
    url: watchUrl,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    videoId,
    title: oembed.title || '',
    channel: oembed.author_name || '',
    channelUrl: oembed.author_url || '',
    poster,
    isOfficialPublisher: samePublisher(producer, oembed.author_name || ''),
  };
}

async function main() {
  const season = Number(arg('season', new Date().getFullYear()));
  const offset = Number(arg('offset', 0));
  const limit = Math.min(Number(arg('limit', 12)), 50);
  const output = arg(
    'output',
    path.join(
      'data',
      'snowboard-films',
      `batch-${season}-${String(offset / limit + 1).padStart(4, '0')}.json`,
    ),
  );

  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  const page = await browser.newPage({
    userAgent: 'TrickBookFilmResearch/1.0 (+https://thetrickbook.com)',
  });
  await page.goto(`${SOURCE_ROOT}/film`, { waitUntil: 'domcontentloaded', timeout: 45000 });

  const candidates = await page.evaluate((targetSeason) => {
    const table = [...document.querySelectorAll('table')].find((element) =>
      element.querySelector('caption')?.textContent.includes(String(targetSeason)),
    );
    if (!table) return [];
    return [...table.querySelectorAll('tbody tr')].map((row) => {
      const cells = row.querySelectorAll('td');
      const filmLink = cells[0]?.querySelector('a[href^="/film/"]');
      const producerLink = cells[1]?.querySelector('a');
      return {
        title: filmLink?.textContent.trim() || '',
        sourcePath: filmLink?.getAttribute('href') || '',
        producer: producerLink?.textContent.trim() || cells[1]?.textContent.trim() || '',
        sourceDetails: cells[2]?.textContent.replace(/\s+/g, ' ').trim() || '',
        sourceWatchLabel: cells[3]?.textContent.replace(/\s+/g, ' ').trim() || '',
      };
    });
  }, season);

  const selected = candidates
    .filter((film) => film.title && film.sourcePath)
    .slice(offset, offset + limit);
  const films = [];

  for (const [index, candidate] of selected.entries()) {
    const detail = await browser.newPage({
      userAgent: 'TrickBookFilmResearch/1.0 (+https://thetrickbook.com)',
    });
    const sourceUrl = new URL(candidate.sourcePath, SOURCE_ROOT).href;
    console.log(`[${index + 1}/${selected.length}] ${candidate.title}`);
    await detail.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

    const extracted = await detail.evaluate(() => {
      const blog = document.querySelector('.blog-post');
      const heading = [...(blog?.querySelectorAll('h4') || [])].find((node) =>
        /full film|watch film|film trailer|teaser/i.test(node.textContent),
      );
      const descriptionParts = [];
      if (heading) {
        let node = heading.nextSibling;
        while (node) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.('iframe, .ratio, table, .table-responsive') ||
              node.querySelector?.('iframe, table'))
          ) {
            break;
          }
          const text = node.textContent?.replace(/\s+/g, ' ').trim();
          if (text) descriptionParts.push(text);
          node = node.nextSibling;
        }
      }

      const youtubeFrame = [...document.querySelectorAll('iframe')].find((frame) =>
        /youtube\.com\/embed\//.test(frame.src),
      );
      const youtubeId = youtubeFrame?.src.match(/embed\/([\w-]{11})/)?.[1] || '';
      const releasedText = [...(blog?.querySelectorAll('div') || [])]
        .map((node) => node.textContent.trim())
        .find((text) => /^Released \d{4}$/.test(text));

      return {
        description: descriptionParts
          .join(' ')
          .replace(/^['"]|['"]$/g, '')
          .trim(),
        releaseYear: Number(releasedText?.match(/\d{4}/)?.[0]) || null,
        youtubeId,
        riders: [...document.querySelectorAll('a[href^="/snowboarder/"]')]
          .map((link) => link.textContent.trim())
          .filter((name) => name && name.toLowerCase() !== 'snowboarders'),
        locations: [...document.querySelectorAll('a[href^="/location/"]')]
          .map((link) => link.textContent.trim())
          .filter(Boolean),
        pageTitle: document.title,
      };
    });

    const youtube = extracted.youtubeId
      ? await youtubeMetadata(extracted.youtubeId, candidate.producer)
      : null;
    const freeFullFilm = /free film/i.test(candidate.sourceDetails) && Boolean(youtube);
    const description =
      extracted.description ||
      `${candidate.title} is a snowboarding film from ${candidate.producer}, released in ${extracted.releaseYear || season}.`;

    films.push({
      slug: slugify(`${candidate.title}-${extracted.releaseYear || season}`),
      type: 'film',
      title: candidate.title,
      description,
      sportTypes: ['snowboarding'],
      tags: ['snowboarding', 'full-length-film', slugify(candidate.producer)].filter(Boolean),
      releaseYear: extracted.releaseYear || season,
      releaseSeason: `${season}/${season + 1}`,
      producedBy: candidate.producer,
      directors: [],
      riders: [...new Set(extracted.riders)],
      locations: [...new Set(extracted.locations)],
      thumbnails: youtube ? { poster: youtube.poster, backdrop: youtube.poster } : {},
      youtubeUrl: youtube?.url || null,
      watchOptions: youtube
        ? [
            {
              platform: 'youtube',
              url: youtube.url,
              embedUrl: youtube.embedUrl,
              access: freeFullFilm ? 'free' : 'parts_or_trailer',
              label: candidate.sourceWatchLabel || (freeFullFilm ? 'Watch free' : 'Watch'),
              channel: youtube.channel,
              channelUrl: youtube.channelUrl,
              isOfficialPublisher: youtube.isOfficialPublisher,
              lastVerifiedAt: new Date().toISOString(),
            },
          ]
        : [],
      sourceRecords: [
        {
          source: 'snowboardingfilms.net',
          url: sourceUrl,
          sourceDetails: candidate.sourceDetails,
          retrievedAt: new Date().toISOString(),
        },
      ],
      rights: {
        hostingStatus: 'external_only',
        basis:
          'Catalog metadata with outbound viewing link; no media rehosting permission inferred.',
      },
      availabilityStatus: youtube ? 'available' : 'needs_review',
      seo: {
        title: `${candidate.title} (${extracted.releaseYear || season}) Snowboard Film`,
        description: description.slice(0, 155),
      },
      isPublished: Boolean(
        description.length >= 50 &&
          youtube &&
          youtube.isOfficialPublisher &&
          extracted.riders.length,
      ),
      researchStatus:
        description.length >= 50 &&
        youtube &&
        youtube.isOfficialPublisher &&
        extracted.riders.length
          ? 'ready'
          : 'needs_editorial_review',
    });
    await detail.close();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await browser.close();
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(
    output,
    `${JSON.stringify({ source: SOURCE_ROOT, season, offset, limit, scrapedAt: new Date().toISOString(), films }, null, 2)}\n`,
  );
  console.log(`Wrote ${films.length} films to ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
