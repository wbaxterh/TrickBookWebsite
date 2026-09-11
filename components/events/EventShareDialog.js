import { Check, Copy, Download, Instagram, Loader2, MessageCircle, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackEventShare } from '../../lib/analytics';
import { formatEventRange, getEventLocation } from '../../lib/eventFormatters';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { getEventImageCandidates } from './EventCoverImage';

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function loadShareImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const objectUrl = URL.createObjectURL(await response.blob());
    try {
      return await loadImage(objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (_error) {
    return null;
  }
}

function drawCover(context, image) {
  const imageRatio = image.width / image.height;
  const canvasRatio = STORY_WIDTH / STORY_HEIGHT;
  const sourceWidth = imageRatio > canvasRatio ? image.height * canvasRatio : image.width;
  const sourceHeight = imageRatio > canvasRatio ? image.height : image.width / canvasRatio;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    STORY_WIDTH,
    STORY_HEIGHT,
  );
}

function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth || !line) {
      line = nextLine;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

async function createStoryFile(event) {
  const canvas = document.createElement('canvas');
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const context = canvas.getContext('2d');
  const imageCandidates = getEventImageCandidates(event);
  let image = null;
  for (const candidate of imageCandidates) {
    image = await loadShareImage(candidate);
    if (image) break;
  }

  const background = context.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  background.addColorStop(0, '#29270c');
  background.addColorStop(1, '#090909');
  context.fillStyle = background;
  context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  if (image) drawCover(context, image);

  const overlay = context.createLinearGradient(0, 500, 0, STORY_HEIGHT);
  overlay.addColorStop(0, 'rgba(0,0,0,0.08)');
  overlay.addColorStop(0.48, 'rgba(0,0,0,0.36)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.96)');
  context.fillStyle = overlay;
  context.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  context.fillStyle = '#facc15';
  context.fillRect(72, 104, 270, 12);
  context.font = '900 56px system-ui, sans-serif';
  context.fillText('TRICKBOOK', 72, 182);

  context.fillStyle = '#ffffff';
  context.font = '900 92px system-ui, sans-serif';
  const titleLines = wrapText(context, event.title || 'Action sports event', STORY_WIDTH - 144);
  const titleY = STORY_HEIGHT - 520 - (titleLines.length - 1) * 100;
  titleLines.forEach((line, index) => {
    context.fillText(line, 72, titleY + index * 100);
  });

  context.fillStyle = '#facc15';
  context.font = '700 42px system-ui, sans-serif';
  context.fillText(formatEventRange(event), 72, STORY_HEIGHT - 260);
  context.fillStyle = '#ffffff';
  context.font = '500 38px system-ui, sans-serif';
  context.fillText(getEventLocation(event), 72, STORY_HEIGHT - 195);
  context.font = '700 30px system-ui, sans-serif';
  context.fillText('Find it on thetrickbook.com', 72, STORY_HEIGHT - 105);

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not create image'))),
      'image/png',
    ),
  );
  return new File([blob], `${event.slug || 'trickbook-event'}-story.png`, {
    type: 'image/png',
  });
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function EventShareDialog({ event }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) setMessage('');
  }, [open]);

  const eventId = event.slug || event._id;
  const shareUrl =
    typeof window === 'undefined' ? '' : `${window.location.origin}/events/${event.slug}`;
  const shareText = `${event.title}\n${formatEventRange(event)}\n${getEventLocation(event)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setMessage('Link copied');
    trackEventShare(eventId, 'copy_link');
  };

  const shareStory = async () => {
    setBusy(true);
    setMessage('Creating your Story image…');
    try {
      const file = await createStoryFile(event);
      const files = [file];
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files }))) {
        await navigator.share({ files, title: event.title, text: `${shareText}\n${shareUrl}` });
        setMessage('Choose Instagram to add it to your Story');
        trackEventShare(eventId, 'instagram_story');
      } else {
        downloadFile(file);
        await navigator.clipboard?.writeText(shareUrl);
        setMessage('Story image downloaded and link copied');
        trackEventShare(eventId, 'story_download');
      }
    } catch (error) {
      if (error?.name !== 'AbortError')
        setMessage('Could not create the image. Try Copy link instead.');
    } finally {
      setBusy(false);
    }
  };

  const shareMessage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: shareText, url: shareUrl });
        trackEventShare(eventId, 'native_share');
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setMessage('Event details copied — paste them into any message');
        trackEventShare(eventId, 'message_copy');
      }
    } catch (error) {
      if (error?.name !== 'AbortError')
        setMessage('Sharing is unavailable. Try Copy link instead.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <Share2 className="h-4 w-4 mr-2" /> Share event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this event</DialogTitle>
          <DialogDescription>
            Bring the crew. Every share includes this event's TrickBook link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 pt-2">
          <Button
            onClick={shareStory}
            disabled={busy}
            className="h-auto justify-start gap-3 bg-gradient-to-r from-fuchsia-600 to-orange-500 px-4 py-3 text-white hover:opacity-90"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Instagram className="h-5 w-5" />
            )}
            <span className="text-left">
              <span className="block font-bold">Instagram Story</span>
              <span className="block text-xs font-normal text-white/85">
                Create a branded 9:16 event image
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={shareMessage}
            className="h-auto justify-start gap-3 px-4 py-3"
          >
            <MessageCircle className="h-5 w-5 text-yellow-500" />
            <span className="text-left">
              <span className="block font-bold">Text or DM</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Use your phone's share menu
              </span>
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={copyLink}
            className="h-auto justify-start gap-3 px-4 py-3"
          >
            <Copy className="h-5 w-5 text-yellow-500" />
            <span className="text-left">
              <span className="block font-bold">Copy link</span>
              <span className="block text-xs font-normal text-muted-foreground">
                Paste it anywhere
              </span>
            </span>
          </Button>
        </div>
        {message && (
          <output className="flex items-center gap-2 text-sm text-muted-foreground">
            {message.includes('downloaded') ? (
              <Download className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {message}
          </output>
        )}
        <p className="text-xs text-muted-foreground">
          Instagram requires you to add its Link sticker manually. The event link is copied when the
          image downloads.
        </p>
      </DialogContent>
    </Dialog>
  );
}
