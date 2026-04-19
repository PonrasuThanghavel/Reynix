const { UserAddress } = require("../model");
const { apiResponse } = require("../utils/helpers");

// Get all addresses for current user
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await UserAddress.findAll({
      where: { user_id: req.user.id },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"],
      ],
    });
    apiResponse(res, 200, true, "Addresses fetched", { addresses });
  } catch (error) {
    next(error);
  }
};

// Create a new address
exports.createAddress = async (req, res, next) => {
  try {
    const data = { ...req.body, user_id: req.user.id };

    // If setting as default, unset other defaults first
    if (data.is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    const address = await UserAddress.create(data);
    apiResponse(res, 201, true, "Address created", { address });
  } catch (error) {
    next(error);
  }
};

// Update an address
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await UserAddress.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!address) {
      return apiResponse(res, 404, false, "Address not found");
    }

    if (req.body.is_default) {
      await UserAddress.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    await address.update(req.body);
    apiResponse(res, 200, true, "Address updated", { address });
  } catch (error) {
    next(error);
  }
};

// Delete an address
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await UserAddress.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!address) {
      return apiResponse(res, 404, false, "Address not found");
    }

    await address.destroy();
    apiResponse(res, 200, true, "Address deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
