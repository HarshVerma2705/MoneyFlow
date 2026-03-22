const mongoose = require("mongoose");


const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "fromAccount is required"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "toAccount is required"],
        index: true
    },
    status:{
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED","REVERSED"],
            message: "Status can be either PENDING, COMPLETED or FAILED"
        },
        default: "PENDING"
    },
    amount:{
        type: Number,
        required: [true, "amount is required"],
        trim: true,
        min:[1,"amount must be greater than 0"],
        match: [/^\d+$/, "invalid amount format"]
    },
    idempotencyKey:{
        type: String,
        required: [true, "idempotencyKey is required"],
        trim: true,
        unique: true,
        index:true
    },
    
    
},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;