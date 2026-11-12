const { allowsKaoriPromotion } = require('../kaoriUi');

describe('Kaori greeting policy', () => {
  it.each([
    '/media',
    '/media/search',
    '/media/couch/[id]',
    '/contact',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/settings',
    '/messages/[conversationId]',
    '/admin',
    '/kaori-live',
  ])('suppresses promotion on %s', (path) => {
    expect(allowsKaoriPromotion(path)).toBe(false);
  });
  it.each([
    '/',
    '/trickbook',
    '/spots',
    '/shops',
    '/events',
    '/riders',
  ])('allows a dismissible in-flow greeting on %s', (path) => {
    expect(allowsKaoriPromotion(path)).toBe(true);
  });
});
