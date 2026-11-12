jest.mock('axios');

const originalBase = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  if (originalBase === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalBase;
  jest.resetModules();
});

describe.each([
  [undefined, 'https://api.thetrickbook.com/api'],
  ['https://api.thetrickbook.com/staging/api/', 'https://api.thetrickbook.com/staging/api'],
  ['http://localhost:9001/api', 'http://localhost:9001/api'],
])('Spots API origin %s', (configured, expected) => {
  function load() {
    jest.resetModules();
    if (configured === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = configured;
    return { axios: require('axios'), api: require('../apiSpots') };
  }

  it('routes list summaries and unchanged filters to the configured API', async () => {
    const { axios, api } = load();
    axios.get.mockResolvedValueOnce({ data: { groups: [{ state: 'CA', count: 2 }] } });
    await expect(api.getSpotsByState('US', 'skateboarding', 'street')).resolves.toEqual({
      CA: [null, null],
    });
    expect(axios.get).toHaveBeenCalledWith(
      `${expected}/spots/browse-summary?country=US&sportType=skateboarding&category=street`,
    );
  });

  it('routes spot details to the same API', async () => {
    const { axios, api } = load();
    axios.get.mockResolvedValueOnce({ data: { _id: 'fixture' } });
    await api.getSpotData('fixture');
    expect(axios.get).toHaveBeenCalledWith(`${expected}/spots/fixture`);
  });

  it('keeps authenticated spot writes in the selected environment', async () => {
    const { axios, api } = load();
    const spot = { name: 'Fixture park' };
    axios.post.mockResolvedValueOnce({ data: spot });
    await api.createSpot(spot, 'fixture-token');
    expect(axios.post).toHaveBeenCalledWith(`${expected}/spots`, spot, {
      headers: { 'x-auth-token': 'fixture-token' },
    });
  });

  it('routes spotlists to that API too', async () => {
    const { axios, api } = load();
    axios.get.mockResolvedValueOnce({ data: [] });
    await api.getSpotLists('fixture-token');
    expect(axios.get).toHaveBeenCalledWith(`${expected}/spotlists`, {
      headers: { 'x-auth-token': 'fixture-token' },
    });
  });
});
