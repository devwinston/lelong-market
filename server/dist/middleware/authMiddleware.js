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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../db"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorisation } = req.headers;
    if (!authorisation) {
        return res.status(401).json({ error: "Authorisation token required" });
    }
    const token = authorisation.split(" ")[1];
    try {
        const { uid } = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        const q = "SELECT * FROM users WHERE uid = $1";
        const values = [uid];
        const result = yield db_1.default.query(q, values);
        const user = result.rows[0];
        if (!user)
            throw new Error("User does not exist");
        req.uid = user.uid;
        req.username = user.username;
        req.email = user.email;
        req.avatar = user.avatar;
        next();
    }
    catch (error) {
        return res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to authorise user",
        });
    }
});
exports.protect = protect;
