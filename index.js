const express = require ('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDb } = require('./db/connectDb');
const router = require('./routes/handler');
const todoRouter = require('./routes/todoRoutes');
//const router = require('./routes/todoRoutes');


dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));

app.use("/", router);
app.use("/api/v1", todoRouter);

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