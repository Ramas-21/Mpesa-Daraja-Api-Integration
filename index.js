import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

const app = express();
app.listen(process.env.PORT, () => {
  console.log(`Application is running on port:${process.env.PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const date = new Date();
const timeStamp =
  date.getFullYear() +
  ("0" + (date.getMonth() + 1)).slice(-2) +
  ("0" + date.getMonth()).slice(-2) +
  ("0" + date.getMonth()).slice(-2) +
  ("0" + date.getMonth()).slice(-2) +
  ("0" + date.getMonth()).slice(-2);

const shortcode = process.env.MPESA_PAYBILL;
const passKey = process.env.MPESA_PASSKEY;

const password = new Buffer.from(shortcode + passKey + timeStamp).toString(
  "base64"
);

const generateToken = async (req, res, next) => {
  const secret = process.env.MPESA_SECRET_KEY;
  const consumer = process.env.MPESA_CONSUME_KEY;

  const auth = new Buffer.from(`${consumer}:${secret}`).toString(
    "base64"
  );
  
  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          authorization: `Basic ${auth}`,
        },
      }
    );
    req.token = response.data.access_token;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

app.post("/stk", generateToken, async (req, res) => {
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;
  const token = req.token; // Get the token from the request object

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timeStamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortcode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "https://mydomain.com/pat",
        AccountReference: `254${phone}`,
        TransactionDesc: "Test",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ error: err.message });
  }
});

app.get("/token", generateToken, (req, res) => {
  res.json({ token: req.token });
});
