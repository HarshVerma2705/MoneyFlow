const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");

/**
 * -create transaction
 * the 10 step Transfer Flow
    * 1. validate request
    * 2. validate idempotency key
    * 3. check account status
    * 4. Derive sender balance from ledger
    * 5. Create transaction (pending)
    * 6. Create Debit ledger
    * 7. Create Credit ledger
    * 8. Update transaction (completed)
    * 9. commit mongodb session
    * 10. send email
    
 */


async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;


    /**
     * 1. validate request
     */
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    }).populate("user");
    if (!fromUserAccount) {
        return res.status(404).json({ message: " From Account not found" });
    }
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    }).populate("user");
    if (!toUserAccount) {
        return res.status(404).json({ message: "To Account not found" });
    }

    /**
     * 2. validate idempotency key
     */

    const isTransactonAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });
    if (isTransactonAlreadyExists) {
        if (isTransactonAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already exists",
                transaction: isTransactonAlreadyExists
            })
        }

        if (isTransactonAlreadyExists.status === "PENDING") {
            return res.status(200).json({ message: "Transaction is processing" });
        }

        if (isTransactonAlreadyExists.status === "FAILED") {
            return res.status(500).json({ message: "Transaction failed" });
        }

        if (isTransactonAlreadyExists.status === "REVERSED") {
            return res.status(200).json({ message: "Transaction is reversed" });
        }
    }

    /**
     * 3. check account status
     */

    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({ message: "From Account or To Account is not active" });
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({ message: `Insufficient balance. current balance is ${balance}, required balance is ${amount}` });
    }


    let updatedTransaction;
    let transaction;
    try { 
    /**
     * 5. Create transaction (pending)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    [transaction] = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }], {
        session
    });

    const debitLedger = await ledgerModel.create([
        {
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }
    ], {
        session
    })

    const creditLedger = await ledgerModel.create([
        {
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }
    ], {
        session
    })

    updatedTransaction = await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session, new: true }
    )



    await session.commitTransaction();
    session.endSession();
} 

catch (error) {
    if (transaction) {
        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "FAILED" }
        );
    }
    return res.status(500).json({ message: "Transaction failed due to internal error", error: error.message });
}

    /** 
     * 10. send email
     */
    await emailService.sendTransactionEmail({
        to: req.user.email,
        name: req.user.name,
        amount,
        toAccount: toUserAccount.user.name
    })

    await emailService.sendReceivedMoneyEmail({
        to: toUserAccount.user.email,
        name: toUserAccount.user.name,
        amount,
        fromAccount: fromUserAccount.user.name
    })

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: updatedTransaction
    })

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const toUserAccount = await accountModel.findById(toAccount);
    if (!toUserAccount) {
        return res.status(404).json({ message: "Account not found" });
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(404).json({ message: "Account not found" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedger = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], {
        session
    })

    const creditLedger = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], {
        session
    })

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();



    return res.status(201).json({
        message: " initail funds Transaction completed successfully",
        transaction: transaction
    });

}


module.exports = { createTransaction, createInitialFundsTransaction };