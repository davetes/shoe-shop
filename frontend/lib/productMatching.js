function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function findMatchingProduct(products, details) {
  const costPrice = Number(details.costPrice || 0);
  const sellingPrice = Number(details.sellingPrice);

  return products.find((product) =>
    normalize(product.name) === normalize(details.name) &&
    normalize(product.size) === normalize(details.size) &&
    normalize(product.color) === normalize(details.color) &&
    Number(product.cost_price) === costPrice &&
    Number(product.selling_price) === sellingPrice
  );
}
