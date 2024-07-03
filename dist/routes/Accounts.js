"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../controllers/db"));
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const account = yield db_1.default.account.findUnique({
            where: {
                userId: req.user.userId,
            },
            select: {
                balance: true,
            },
        });
        if (!account) {
            return res.status(404).json({
                error: "Account not found",
            });
        }
        res.status(200).json({
            balance: account.balance,
        });
    }
    catch (e) {
        res.status(500).json({
            error: "Something went wrong",
        });
        console.log(e.message);
    }
}));
router.post("/transfer", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, receiver } = req.body;
        const sender = req.user.userId;
        const senderBalance = yield db_1.default.account.findMany({
            where: {
                userId: sender
            },
            select: {
                balance: true
            }
        });
        const receiverBalance = yield db_1.default.account.findMany({
            where: {
                userId: receiver
            },
            select: {
                balance: true
            }
        });
        if (senderBalance[0].balance < amount) {
            return res.status(400).json({
                error: "Insufficient balance"
            });
        }
        yield db_1.default.account.update({
            where: {
                userId: sender
            },
            data: {
                balance: senderBalance[0].balance - amount
            }
        });
        yield db_1.default.account.update({
            where: {
                userId: receiver
            },
            data: {
                balance: receiverBalance[0].balance + amount
            }
        });
        res.status(200).json({
            message: "Transfer successful"
        });
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({
            error: e.message
        });
    }
}));
module.exports = router;
