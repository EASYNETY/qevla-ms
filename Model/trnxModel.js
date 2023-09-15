const mongoose = require("mongoose");


// Define a MongoDB schema for transactions
const TransactionSchema = new mongoose.Schema({
    paystack_id: String, // Paystack transaction ID
    account_holder_name: String,
    account_number: String,
    bank_name: String,
    amount: Number,
    // Add more fields as needed
  });

  module.exports = mongoose.model("Transaction", TransactionSchema);
  