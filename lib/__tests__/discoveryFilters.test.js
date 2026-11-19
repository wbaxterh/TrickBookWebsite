const { selectedFilterCount } = require('../discoveryFilters');

test('default and absent criteria do not count as selected', () => {
  expect(
    selectedFilterCount({ q: '', sport: 'all', radius: '100', location: '', service: 'all' }),
  ).toBe(0);
  expect(selectedFilterCount({}, ['radius', 'service'])).toBe(0);
});

test('changed distance counts even before geolocation and becomes resettable', () => {
  expect(selectedFilterCount({ radius: '25', sport: 'all' })).toBe(1);
  expect(selectedFilterCount({ radius: 'any' })).toBe(1);
});

test('advanced count excludes the already visible search and sport controls', () => {
  const filters = {
    q: 'park',
    sport: 'skateboarding',
    radius: '50',
    location: 'San Diego',
    service: 'repairs',
  };
  expect(selectedFilterCount(filters)).toBe(5);
  expect(selectedFilterCount(filters, ['location', 'radius', 'service'])).toBe(3);
});
