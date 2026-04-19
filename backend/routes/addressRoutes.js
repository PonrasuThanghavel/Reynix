const express = require("express");
const router = express.Router();
const addressController = require("../controller/addressController");
const { authenticate } = require("../utils/authMiddleware");

router.use(authenticate);

router.get("/", addressController.getAddresses);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
