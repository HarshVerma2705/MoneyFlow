const accountModel =require("../models/account.model");


async function createAccountController(req,res){
    try {
        const user = req.user;
        const account = await accountModel.create({
            user: user._id
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            account
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function getUserAccountsController(req,res){
    try {
        const user = req.user;
        const accounts = await accountModel.find({
            user: user._id
        });

        res.status(200).json({
            success: true,
            message: "Accounts fetched successfully",
            accounts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function getAccountBalanceController(req,res){
    const{accountId} =req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    });
    if(!account){
        return res.status(404).json({ success: false, message: "Account not found" });
    }
    const balance = await account.getBalance();
    res.status(200).json({ success: true, message: "Account balance fetched successfully", accountId: account._id, balance: balance });
}



module.exports = {createAccountController,getUserAccountsController,getAccountBalanceController};
