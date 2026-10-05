const axios = require('axios');

jest.mock('axios');

const {
  getShopRatings,
  setShopRating,
  deleteShopRating,
  getShops,
  getShop,
} = require('../apiShops');

const API_BASE_URL = 'https://api.thetrickbook.com/api';

describe('apiShops', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getShopRatings', () => {
    it('returns ratings data for a shop', async () => {
      const mockData = {
        averageRating: 4.2,
        ratingCount: 15,
        distribution: { 1: 0, 2: 1, 3: 2, 4: 5, 5: 7 },
        myRating: null,
      };
      axios.get.mockResolvedValueOnce({ data: mockData });

      const result = await getShopRatings('test-shop');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/shops/test-shop/ratings`, {
        headers: {},
      });
      expect(result).toEqual(mockData);
    });

    it('includes auth header when token provided', async () => {
      const mockData = { averageRating: 4.0, ratingCount: 10, distribution: {}, myRating: 5 };
      axios.get.mockResolvedValueOnce({ data: mockData });

      await getShopRatings('test-shop', 'test-token');

      expect(axios.get).toHaveBeenCalledWith(`${API_BASE_URL}/shops/test-shop/ratings`, {
        headers: { Authorization: 'Bearer test-token' },
      });
    });

    it('returns default data when endpoint returns 404', async () => {
      axios.get.mockRejectedValueOnce({ response: { status: 404 } });

      const result = await getShopRatings('nonexistent-shop');

      expect(result).toEqual({
        averageRating: null,
        ratingCount: 0,
        distribution: {},
        myRating: null,
      });
    });

    it('throws on other errors', async () => {
      axios.get.mockRejectedValueOnce({ response: { status: 500 } });

      await expect(getShopRatings('test-shop')).rejects.toEqual({ response: { status: 500 } });
    });
  });

  describe('setShopRating', () => {
    it('sends PUT request with rating', async () => {
      const mockResponse = {
        averageRating: 4.5,
        ratingCount: 10,
        distribution: { 5: 5, 4: 3, 3: 2 },
        myRating: 5,
      };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await setShopRating('test-shop', 5, 'test-token');

      expect(axios.put).toHaveBeenCalledWith(
        `${API_BASE_URL}/shops/test-shop/rating`,
        { rating: 5 },
        { headers: { Authorization: 'Bearer test-token' } },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteShopRating', () => {
    it('sends DELETE request', async () => {
      const mockResponse = {
        averageRating: 4.0,
        ratingCount: 9,
        distribution: { 5: 4, 4: 3, 3: 2 },
        myRating: null,
      };
      axios.delete.mockResolvedValueOnce({ data: mockResponse });

      const result = await deleteShopRating('test-shop', 'test-token');

      expect(axios.delete).toHaveBeenCalledWith(`${API_BASE_URL}/shops/test-shop/rating`, {
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getShops', () => {
    it('returns shops array from API', async () => {
      const mockShops = [
        { _id: '1', name: 'Shop 1', userRating: { averageRating: 4.5, ratingCount: 10 } },
        { _id: '2', name: 'Shop 2', userRating: { averageRating: 3.8, ratingCount: 5 } },
      ];
      axios.get.mockResolvedValueOnce({ data: { shops: mockShops, totalCount: 2 } });

      const result = await getShops({});

      expect(result.shops).toEqual(mockShops);
      expect(result.shops[0].userRating.averageRating).toBe(4.5);
    });
  });

  describe('getShop', () => {
    it('returns shop with userRating field', async () => {
      const mockShop = {
        _id: '1',
        name: 'Test Shop',
        slug: 'test-shop',
        userRating: { averageRating: 4.2, ratingCount: 15 },
      };
      axios.get.mockResolvedValueOnce({ data: { shop: mockShop } });

      const result = await getShop('test-shop');

      expect(result.userRating).toEqual({ averageRating: 4.2, ratingCount: 15 });
    });
  });
});
