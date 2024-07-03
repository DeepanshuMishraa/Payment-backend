import express from "express";


const app = express();
const PORT = 3001;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const userRouter  = require("./routes/User");
const accountsRouter = require("./routes/Accounts")

app.use("/user",userRouter);
app.use("/accounts",accountsRouter)

app.get("/",(req,res)=>{
    res.send("Welcome to the server");
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})