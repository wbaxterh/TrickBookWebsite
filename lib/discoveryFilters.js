// Count selected criteria, including distance selected before location is enabled.
export function selectedFilterCount(filters, keys = Object.keys(filters)) {
  return keys.filter((key) => {
    const value = filters[key];
    return key === 'radius' ? Boolean(value && value !== '100') : Boolean(value && value !== 'all');
  }).length;
}
