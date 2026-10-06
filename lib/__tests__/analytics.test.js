jest.mock('../posthog', () => ({
  posthog: { __loaded: true, capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));

const { posthog } = require('../posthog');
const {
  buildMeaningfulEvent,
  trackCalendarAdded,
  trackCommentCreated,
  trackHomieConnected,
  trackPostCreated,
  trackTrickLanded,
} = require('../analytics');

const SENSITIVE =
  /(^|_)(email|password|token|authorization|prompt|message|latitude|longitude|receipt)($|_)/i;

function lastCapture() {
  const calls = posthog.capture.mock.calls;
  return calls[calls.length - 1];
}

beforeEach(() => posthog.capture.mockClear());

describe('meaningful-event names match the backend retention contract', () => {
  it('calendar adds are reported as event_calendar_added', () => {
    trackCalendarAdded({ _id: 'evt1', slug: 'malibu-jam' }, 'google');
    const [name, props] = lastCapture();
    expect(name).toBe('event_calendar_added');
    expect(props).toMatchObject({ event_id: 'evt1', event_slug: 'malibu-jam', calendar: 'google' });
  });

  it('emits the four community and progression events with ids and enums only', () => {
    trackTrickLanded({ trickId: 't1', listId: 'l1' });
    expect(lastCapture()[0]).toBe('trick_landed');
    expect(lastCapture()[1]).toMatchObject({ trick_id: 't1', list_id: 'l1' });

    trackPostCreated({ postId: 'p1', mediaType: 'video', hasSpot: true, trickCount: 2 });
    expect(lastCapture()[0]).toBe('post_created');
    expect(lastCapture()[1]).toMatchObject({
      post_id: 'p1',
      media_type: 'video',
      has_spot: true,
      trick_count: 2,
    });

    trackCommentCreated({ postId: 'p1', isReply: true });
    expect(lastCapture()[0]).toBe('comment_created');
    expect(lastCapture()[1]).toMatchObject({ post_id: 'p1', is_reply: true });

    trackHomieConnected({ userId: 'u2' });
    expect(lastCapture()[0]).toBe('homie_connected');
    expect(lastCapture()[1]).toMatchObject({ homie_id: 'u2' });
  });

  it('never carries a key the backend would strip as sensitive', () => {
    for (const kind of [
      'trick_landed',
      'post_created',
      'comment_created',
      'homie_connected',
      'event_calendar_added',
    ]) {
      const built = buildMeaningfulEvent(kind, {
        trickId: 'a',
        listId: 'b',
        postId: 'c',
        userId: 'd',
        eventId: 'e',
        eventSlug: 'f',
        calendar: 'g',
      });
      expect(built.name).toBe(kind);
      for (const [key, value] of Object.entries(built.properties)) {
        expect(key).not.toMatch(SENSITIVE);
        expect(['string', 'boolean', 'number']).toContain(value === null ? 'string' : typeof value);
      }
    }
  });

  it('normalises ids to strings and tolerates missing values', () => {
    const built = buildMeaningfulEvent('post_created', { postId: 42, mediaType: 'gif' });
    expect(built.properties).toEqual({
      post_id: '42',
      media_type: 'image',
      has_spot: false,
      trick_count: 0,
    });
    expect(buildMeaningfulEvent('unknown_kind')).toBeNull();
    expect(buildMeaningfulEvent('homie_connected', {}).properties.homie_id).toBeNull();
  });
});
