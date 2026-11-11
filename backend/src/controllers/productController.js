const { listProducts, createProduct } = require('../models/productModel');
const { httpError } = require('../utils/errorHandler');

async function list(req, res) {
  res.json(await listProducts());
}

async function create(req, res) {
  const { name, size, color, costPrice = 0, sellingPrice, price } = req.body;
  const resolvedSellingPrice = sellingPrice ?? price;
  if (!name || !size || !color || resolvedSellingPrice === undefined) {
    throw httpError('name, size, color, and selling price are required');
  }
  if (Number(costPrice) < 0 || Number(resolvedSellingPrice) < 0) {
    throw httpError('Prices cannot be negative');
  }
  res.status(201).json(await createProduct({
    name: String(name).trim(),
    size: String(size).trim(),
    color: String(color).trim(),
    costPrice: Number(costPrice),
    sellingPrice: Number(resolvedSellingPrice)
  }));
}

module.exports = { list, create };
