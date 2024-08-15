import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app = express();
app.listen(process.env.PORT, ()=> {
    console.log(`Application is running on port:${process.env.PORT}`)
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get('/', (req,res) => {
    res.send("Yes it is working good work")
})