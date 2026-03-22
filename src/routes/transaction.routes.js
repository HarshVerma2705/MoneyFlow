const {Router} = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");


const transactionRoutes = Router();

/**
 * -POST /api/transactions/
 * Create transaction
 */
transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);

/**
 * -POST api
 */
 transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemMiddleware,transactionController.createInitialFundsTransaction);

module.exports = transactionRoutes;
