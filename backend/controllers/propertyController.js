const Property = require('../models/Property');

// Helper to generate unique property code
const generatePropertyCode = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `RENT-${randomNum}`;
};

// @desc    Get all active properties (with optional filter/search)
// @route   GET /api/properties
// @access  Public
const getProperties = async (req, res, next) => {
  try {
    const { type, search, minPrice, maxPrice, propertyCode } = req.query;

    const query = { isActive: true };

    if (type) {
      query.type = type;
    }

    if (propertyCode) {
      query.propertyCode = propertyCode.toUpperCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('ownerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'ownerId',
      'name email phone profileImage bio'
    );

    if (!property) {
      return res.status(404).json({
        status: 'fail',
        message: 'Property not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current owner's properties
// @route   GET /api/properties/my-properties
// @access  Private (Owner only)
const getOwnerProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: 'success',
      results: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Owner only)
const createProperty = async (req, res, next) => {
  try {
    const {
      title,
      type,
      price,
      description,
      images,
      facilities,
      address,
      latitude,
      longitude,
    } = req.body;

    // Validation
    if (!title || !type || !price || !description || !address) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: title, type, price, description, address',
      });
    }

    // Generate unique code
    let code = generatePropertyCode();
    let existingCode = await Property.findOne({ propertyCode: code });
    while (existingCode) {
      code = generatePropertyCode();
      existingCode = await Property.findOne({ propertyCode: code });
    }

    const property = await Property.create({
      ownerId: req.user._id,
      title,
      type,
      price: Number(price),
      description,
      images: images || [],
      facilities: facilities || [],
      address,
      latitude: latitude ? Number(latitude) : 0,
      longitude: longitude ? Number(longitude) : 0,
      propertyCode: code,
    });

    res.status(201).json({
      status: 'success',
      message: 'Property listed successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner only - ownership validated)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'fail',
        message: 'Property not found',
      });
    }

    // Validate Ownership
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You are not authorized to update this property listing',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner only - ownership validated)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        status: 'fail',
        message: 'Property not found',
      });
    }

    // Validate Ownership
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You are not authorized to delete this property listing',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      status: 'success',
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  getOwnerProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
