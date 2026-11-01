const axios = require('axios');

jest.mock('axios');

const { getSortedTricksData, getSortedTricksDataOrThrow } = require('../apiTrickipedia');

const firstPage = Array.from({ length: 250 }, (_, index) => ({
  _id: `trick-${index}`,
  name: `Early trick ${index}`,
  category: 'Skateboarding',
  url: `early-trick-${index}`,
}));
const ollie = { _id: 'ollie-id', name: 'Ollie', category: 'Skateboarding', url: 'ollie' };
const snowboardOllie = {
  _id: 'snowboard-ollie-id',
  name: 'Ollie (Snowboard)',
  category: 'Snowboarding',
  url: 'ollie-snowboard',
};

beforeEach(() => jest.resetAllMocks());

test('includes tricks beyond the first API page and authenticates every page', async () => {
  axios.get.mockResolvedValueOnce({ data: firstPage }).mockResolvedValueOnce({ data: [ollie] });

  const tricks = await getSortedTricksData(undefined, 'test-token');

  expect(tricks).toHaveLength(251);
  expect(tricks[250]).toMatchObject({ id: 'ollie-id', url: 'ollie' });
  expect(axios.get.mock.calls.map(([, options]) => options)).toEqual([
    { params: { limit: 250, skip: 0 }, headers: { 'x-auth-token': 'test-token' } },
    { params: { limit: 250, skip: 250 }, headers: { 'x-auth-token': 'test-token' } },
  ]);
});

test('filters categories after loading later pages, including same-name tricks', async () => {
  axios.get
    .mockResolvedValueOnce({ data: firstPage })
    .mockResolvedValueOnce({ data: [ollie, snowboardOllie] });

  await expect(getSortedTricksData('Snowboarding')).resolves.toEqual([
    expect.objectContaining({ id: snowboardOllie._id, url: 'ollie-snowboard' }),
  ]);
});

test('continues through multiple full pages and terminates on an empty page', async () => {
  axios.get
    .mockResolvedValueOnce({ data: firstPage })
    .mockResolvedValueOnce({ data: firstPage })
    .mockResolvedValueOnce({ data: [] });

  await expect(getSortedTricksData()).resolves.toHaveLength(500);
  expect(axios.get.mock.calls.map(([, options]) => options.params.skip)).toEqual([0, 250, 500]);
});

test('admin catalog also includes later pages and sorts the complete result', async () => {
  axios.get.mockResolvedValueOnce({ data: firstPage }).mockResolvedValueOnce({ data: [ollie] });

  const tricks = await getSortedTricksDataOrThrow('Skateboarding');

  expect(tricks).toHaveLength(251);
  expect(tricks[250]).toMatchObject({ id: 'ollie-id' });
});

test('does not return a misleading partial catalog when a later page fails', async () => {
  axios.get
    .mockResolvedValueOnce({ data: firstPage })
    .mockRejectedValueOnce(new Error('API unavailable'));
  await expect(getSortedTricksData()).resolves.toEqual([]);

  axios.get
    .mockResolvedValueOnce({ data: firstPage })
    .mockRejectedValueOnce(new Error('API unavailable'));
  await expect(getSortedTricksDataOrThrow()).rejects.toThrow('API unavailable');
});
