"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3001;
const cors = require("cors");
app.use(cors());
app.use(express_1.default.json());
const userRouter = require("./routes/User");
const accountsRouter = require("./routes/Accounts");
app.use("/user", userRouter);
app.use("/accounts", accountsRouter);
app.get("/", (req, res) => {
    res.send("Welcome to the server");
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
