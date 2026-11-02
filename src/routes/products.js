const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

let products = [];
let currentId = 1;

const productBodySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().greater(0).required(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional().allow('')
});

const productPatchSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  price: Joi.number().greater(0).optional(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(500).optional().allow('')
});

const queryFilterSchema = Joi.object({
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

router.get('/', validate(queryFilterSchema, 'query'), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.query;
  let filteredProducts = [...products];
  if (category) filteredProducts = filteredProducts.filter(p => p.category === category);
  if (minPrice !== undefined) filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
  if (maxPrice !== undefined) filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

  const total = filteredProducts.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredProducts.slice(startIndex, startIndex + limit);

  res.json({ data: paginatedData, total, page, limit });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  res.json(product);
});

router.post('/', validate(productBodySchema, 'body'), (req, res) => {
  const newProduct = {
    id: currentId++,
    ...req.body,
    imageUrl: null,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validate(productBodySchema, 'body'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return res.status(404).json({ error: 'Товар не найден' });

  products[productIndex] = { ...products[productIndex], ...req.body };
  res.json(products[productIndex]);
});

router.patch('/:id', validate(productPatchSchema, 'body'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return res.status(404).json({ error: 'Товар не найден' });

  products[productIndex] = { ...products[productIndex], ...req.body };
  res.json(products[productIndex]);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) return res.status(404).json({ error: 'Товар не найден' });

  products.splice(productIndex, 1);
  res.status(204).send();
});

router.post('/:id/image', upload.single('image'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Товар не найден' });
  if (!req.file) return res.status(400).json({ error: 'Пожалуйста, прикрепите файл изображения (поле "image")' });

  product.imageUrl = `/uploads/products/${req.file.filename}`;
  res.json(product);
});

module.exports = router;
