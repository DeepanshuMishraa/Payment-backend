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
const db_1 = __importDefault(require("../controllers/db"));
const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const signUpBody = zod.object({
    name: zod.string().min(3).max(255),
    email: zod.string().email(),
    password: zod.string().min(6).max(255)
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const {success} = signUpBody.parse(req.body);
        // if(!success){
        //    return  res.status(501).json({
        //         error:"Email already taken/invaild input"
        //     })
        // }
        const existingUser = yield db_1.default.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (existingUser) {
            return res.status(501).json({
                error: "Email already taken"
            });
        }
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hashSync(req.body.password, salt);
        const createdUser = yield db_1.default.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            }
        });
        const userid = createdUser.id;
        // create an account for the user
        yield db_1.default.account.create({
            data: {
                userId: userid,
                balance: 1 + Math.random() * 1000
            }
        });
        const token = jwt.sign({
            userid
        }, process.env.JWT_SECRET);
        res.status(200).json({
            message: "User Created Successfully",
            createdUser,
            token
        });
    }
    catch (err) {
        res.status(501).json({
            error: "Something went wrong"
        });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield db_1.default.user.findUnique({
            where: {
                email,
            },
            select: {
                password: true,
                id: true,
            },
        });
        if (!existingUser) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        const correctPass = yield bcrypt.compare(password, existingUser.password);
        if (!correctPass) {
            return res.status(401).json({
                error: "Invalid email or password",
            });
        }
        const userid = existingUser.id;
        const token = jwt.sign({
            userid: userid,
        }, process.env.JWT_SECRET);
        res.status(200).json({
            message: "User Logged In Successfully",
            token,
        });
    }
    catch (e) {
        res.status(500).json({
            error: "Something went wrong",
            message: e.message,
        });
        console.log(e);
    }
}));
router.put("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password } = req.body;
        const update = yield db_1.default.user.update({
            where: {
                id: req.user.userid
            },
            data: {
                name,
                password
            }
        });
    }
    catch (e) {
        res.status(501).json({
            error: "Something went wrong"
        });
    }
}));
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = req.query.filter;
        const users = yield db_1.default.user.findMany({
            where: {
                name: {
                    contains: filter
                }
            }
        });
        res.status(200).json({
            users
        });
    }
    catch (e) {
        console.log(e);
        res.status(501).json({
            error: "Something went wrong",
            message: e.message
        });
    }
}));
module.exports = router;
