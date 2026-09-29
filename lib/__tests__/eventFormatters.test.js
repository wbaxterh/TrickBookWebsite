import { formatEventDate, getPrimarySport, getSportMeta } from '../eventFormatters';

describe('getPrimarySport and getSportMeta', () => {
  it('takes the first listed sport and falls back to action sports', () => {
    expect(getPrimarySport({ sports: ['bmx', 'mtb'] })).toBe('bmx');
    expect(getPrimarySport({ sports: [] })).toBe('action-sports');
    expect(getPrimarySport(undefined)).toBe('action-sports');
  });

  it('returns the catalog entry for known sports and a readable stub otherwise', () => {
    expect(getSportMeta('skateboarding')).toMatchObject({ label: 'Skateboarding', emoji: '🛹' });
    expect(getSportMeta('kite-surfing')).toEqual({
      id: 'kite-surfing',
      label: 'kite surfing',
      emoji: '⚡',
    });
    expect(getSportMeta(undefined).label).toBe('Action sports');
  });
});

describe('formatEventDate', () => {
  it('renders TBA when there is no start', () => {
    expect(formatEventDate({})).toEqual({ month: 'TBA', day: '', date: 'Date TBA', time: '' });
  });

  it('formats in the event timezone, not the machine timezone', () => {
    const event = { startAt: '2026-09-26T19:00:00Z', timezone: 'America/Los_Angeles' };
    expect(formatEventDate(event)).toEqual({
      month: 'SEP',
      day: '26',
      date: 'Sep 26, 2026',
      time: '12:00 PM',
    });
  });

  it('marks the time as TBA when the event says so', () => {
    const event = { startAt: '2026-09-26T19:00:00Z', timezone: 'UTC', timeTba: true };
    expect(formatEventDate(event).time).toBe('Time TBA');
  });
});
