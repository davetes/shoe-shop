export function sortInventoryRows(rows, sortOrder) {
  return [...rows].sort((first, second) => {
    const nameOrder = String(first.name).localeCompare(String(second.name), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    const sizeOrder = String(first.size).localeCompare(String(second.size), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    const colorOrder = String(first.color).localeCompare(String(second.color), undefined, {
      sensitivity: 'base',
    });
    const storeOrder = String(first.store_name || '').localeCompare(String(second.store_name || ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });

    if (sortOrder === 'newest' || sortOrder === 'oldest') {
      const firstCreated = new Date(first.product_created_at || 0).getTime();
      const secondCreated = new Date(second.product_created_at || 0).getTime();
      const dateOrder = sortOrder === 'newest'
        ? secondCreated - firstCreated
        : firstCreated - secondCreated;
      if (dateOrder) return dateOrder;
    } else if (sortOrder === 'name-desc') {
      if (nameOrder) return -nameOrder;
    } else if (nameOrder) {
      return nameOrder;
    }

    return sizeOrder || colorOrder || storeOrder;
  });
}
