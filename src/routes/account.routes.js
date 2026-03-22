const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");



const router = express.Router();

/**
 * - create account route
 * - POST /api/accounts/create
 * - protected route
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)


/**
 * -GET /api/accounts/
 * -protected route
 * -get all accounts of user
 */
router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsController)

/**
 * -GET /api/accounts/:accountId
 * -protected route
 * -get account balance
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)



module.exports = router;