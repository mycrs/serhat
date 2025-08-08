const Category = require('../models/Category');
const Joi = require('joi');

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().allow('')
});

const categoryController = {
  // Get all categories
  async getAll(req, res) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single category
  async getById(req, res) {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new category
  async create(req, res) {
    try {
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const category = new Category(value);
      await category.save();
      res.status(201).json(category);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Category name already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Update category
  async update(req, res) {
    try {
      const { error, value } = categorySchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        value,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json(category);
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ error: 'Category name already exists' });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // Delete category
  async delete(req, res) {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = categoryController;