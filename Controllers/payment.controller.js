const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const Transaction = require('../Model/trnxModel')


const app = express();

app.use(bodyParser.json());

module.exports.Transaction = async (req, res) => {
    const { email, amount, subaccount, transaction_charge } = req.body;

    const data = JSON.stringify({
        email,
        amount,
        subaccount,
        transaction_charge,
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: 'Bearer YOUR_SECRET_KEY',
            'Content-Type': 'application/json',
        },
    };

    const paystackRequest = https.request(options, (paystackResponse) => {
        let responseData = '';

        paystackResponse.on('data', (chunk) => {
            responseData += chunk;
        });

        paystackResponse.on('end', () => {
            res.json(JSON.parse(responseData));
        });
    });

    saveTransactionToDatabase(paystackData);

    paystackRequest.on('error', (error) => {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while initializing payment.' });
    });

    paystackRequest.write(data);
    paystackRequest.end();
};
function saveTransactionToDatabase(paystackData) {
    // Extract the required fields from Paystack data
    const {
        id: paystackId,
        customer: {
            account_name: accountHolderName,
        },
        authorization: {
            account_number: accountNumber,
            bank: bankName,
        },
        amount,
    } = paystackData.data;

    // Create a new transaction document
    const newTransaction = new Transaction({
        paystack_id: paystackId,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        bank_name: bankName,
        amount: amount / 100, // Convert from kobo to naira or your preferred currency
        // Add more fields from Paystack data as needed
    });

    // Save the transaction to the database
    newTransaction.save()
        .then(() => {
            console.log('Transaction saved to the database.');
        })
        .catch((error) => {
            console.error('Error saving transaction:', error);
        });
}
