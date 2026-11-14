const axios = require('axios');

jest.mock('axios');

const { getCouchVideos } = require('../apiMedia');

describe('Couch catalog search', () => {
  beforeEach(() => jest.clearAllMocks());

  it('encodes a real query with filters, pagination and cancellation', async () => {
    const videos = [{ _id: 'film', title: 'A & B' }];
    axios.get.mockResolvedValueOnce({ data: videos });
    const controller = new AbortController();
    await expect(
      getCouchVideos({
        q: '  A & B  ',
        sport: 'skateboarding',
        page: 2,
        limit: 24,
        sort: 'title',
        signal: controller.signal,
      }),
    ).resolves.toEqual(videos);
    const [url, options] = axios.get.mock.calls[0];
    const params = new URL(url).searchParams;
    expect(params.get('q')).toBe('A & B');
    expect(params.get('sport')).toBe('skateboarding');
    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('24');
    expect(params.get('sort')).toBe('title');
    expect(options.signal).toBe(controller.signal);
  });

  it('does not send empty search or all-sports filters', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    await getCouchVideos({ q: '   ', sport: 'all' });
    const params = new URL(axios.get.mock.calls[0][0]).searchParams;
    expect(params.has('q')).toBe(false);
    expect(params.has('sport')).toBe(false);
  });

  it('keeps errors distinct from an empty result', async () => {
    axios.get.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(getCouchVideos({ q: 'snow' })).rejects.toThrow('Unavailable');
  });
});
