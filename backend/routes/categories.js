const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Get single category
router.get('/:id', categoryController.getById);

// POST /api/categories - Create new category
router.post('/', categoryController.create);

// PUT /api/categories/:id - Update category
router.put('/:id', categoryController.update);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.delete);

module.exports = router;