const express = require ('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDb } = require('../ToDo-App-backend/db/connectDb');
const router = require('../ToDo-App-backend/routes/handler');


dotenv.config();

const app = express();

app.use(express.json());

app.use("/", router);

app.use(cors({
    origin: "*"
}));

app.get("/", (req, res) => {
    res.status(200).json({ info: "API working perfectly"})
});


const port = 8080;

app.listen(port, async()=>{
    console.log(`server running at port ${port}`);
    await connectDb();
})