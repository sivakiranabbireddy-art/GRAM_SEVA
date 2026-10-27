const { Category } = require('../models');

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: { $ne: false } }).lean();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
}

async function getAllCategoriesAdmin(req, res, next) {
  try {
    const categories = await Category.find().lean();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, icon = 'Wrench', description = '', basePriceEstimate = 299 } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const id = `cat_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const existing = await Category.findOne({
      $or: [{ id }, { name: new RegExp(`^${name.trim()}$`, 'i') }]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const newCat = await Category.create({
      id,
      name: name.trim(),
      icon,
      description: description.trim(),
      basePriceEstimate: parseInt(basePriceEstimate, 10) || 299,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Service category created successfully.',
      category: newCat
    });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, icon, description, basePriceEstimate, isActive } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (icon) updateFields.icon = icon;
    if (description !== undefined) updateFields.description = description.trim();
    if (basePriceEstimate !== undefined) updateFields.basePriceEstimate = parseInt(basePriceEstimate, 10);
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updated = await Category.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory
};
