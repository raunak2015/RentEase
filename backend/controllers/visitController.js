const VisitRequest = require('../models/VisitRequest');
const Property = require('../models/Property');
const { createNotification } = require('./notificationController');

// @desc    Create a new visit request (Tenant)
// @route   POST /api/visits
// @access  Private (Tenant)
const createVisitRequest = async (req, res, next) => {
  try {
    const { propertyId, requestedDate, requestedTimeSlot, note } = req.body;

    if (!propertyId || !requestedDate || !requestedTimeSlot) {
      return res.status(400).json({
        status: 'fail',
        message: 'Property, requested date, and time slot are required',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: 'fail',
        message: 'Property not found',
      });
    }

    if (!property.isActive) {
      return res.status(400).json({
        status: 'fail',
        message: 'Visit requests cannot be sent for inactive properties',
      });
    }

    const visitRequest = await VisitRequest.create({
      tenantId: req.user._id,
      ownerId: property.ownerId,
      propertyId,
      requestedDate,
      requestedTimeSlot,
      note: note || '',
    });

    const populated = await visitRequest.populate([
      { path: 'propertyId', select: 'title address images type price' },
      { path: 'ownerId', select: 'name email phone profileImage' },
    ]);

    // Notify the owner about the new visit request
    await createNotification({
      userId: property.ownerId,
      type: 'visit_request',
      title: 'New Visit Request',
      body: `A tenant has requested to visit "${property.title}". Tap to review.`,
      relatedId: visitRequest._id,
      relatedModel: 'VisitRequest',
    });

    res.status(201).json({
      status: 'success',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visit requests for the logged-in tenant
// @route   GET /api/visits/my-requests
// @access  Private (Tenant)
const getTenantVisitRequests = async (req, res, next) => {
  try {
    const visits = await VisitRequest.find({ tenantId: req.user._id })
      .populate('propertyId', 'title address images type price')
      .populate('ownerId', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: visits.length,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visit requests for properties owned by the logged-in owner
// @route   GET /api/visits/incoming
// @access  Private (Owner)
const getOwnerVisitRequests = async (req, res, next) => {
  try {
    const visits = await VisitRequest.find({ ownerId: req.user._id })
      .populate('propertyId', 'title address images type price')
      .populate('tenantId', 'name email phone profileImage bio')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: visits.length,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visit request status (Owner can accept/reject, Tenant can cancel)
// @route   PATCH /api/visits/:id/status
// @access  Private
const updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['accepted', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const visit = await VisitRequest.findById(id);
    if (!visit) {
      return res.status(404).json({
        status: 'fail',
        message: 'Visit request not found',
      });
    }

    const userId = req.user._id.toString();
    const isOwner = visit.ownerId.toString() === userId;
    const isTenant = visit.tenantId.toString() === userId;

    if (!isOwner && !isTenant) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to update this visit request',
      });
    }

    // Tenants can only cancel their own requests
    if (isTenant && status !== 'cancelled') {
      return res.status(403).json({
        status: 'fail',
        message: 'Tenants can only cancel their visit requests',
      });
    }

    // Owners can only accept or reject
    if (isOwner && status === 'cancelled') {
      return res.status(403).json({
        status: 'fail',
        message: 'Owners cannot cancel a visit request',
      });
    }

    visit.status = status;
    await visit.save();

    const updated = await VisitRequest.findById(id)
      .populate('propertyId', 'title address images type price')
      .populate('tenantId', 'name email phone profileImage bio')
      .populate('ownerId', 'name email phone profileImage');

    // Fire notification to the appropriate party
    const propertyTitle = updated.propertyId?.title || 'your property';
    if (status === 'accepted') {
      await createNotification({
        userId: visit.tenantId,
        type: 'visit_accepted',
        title: 'Visit Request Accepted! 🎉',
        body: `Your visit to "${propertyTitle}" on ${visit.requestedDate} (${visit.requestedTimeSlot}) has been accepted by the owner.`,
        relatedId: visit._id,
        relatedModel: 'VisitRequest',
      });
    } else if (status === 'rejected') {
      await createNotification({
        userId: visit.tenantId,
        type: 'visit_rejected',
        title: 'Visit Request Declined',
        body: `Unfortunately your visit request to "${propertyTitle}" on ${visit.requestedDate} was not accepted.`,
        relatedId: visit._id,
        relatedModel: 'VisitRequest',
      });
    }

    res.status(200).json({
      status: 'success',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisitRequest,
  getTenantVisitRequests,
  getOwnerVisitRequests,
  updateVisitStatus,
};
