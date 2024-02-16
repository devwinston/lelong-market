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
exports.resetUser = exports.updateUser = exports.getUser = exports.signinUser = exports.signupUser = void 0;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = __importDefault(require("../db"));
const sendEmail_1 = require("../utilities/sendEmail");
const signupUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    try {
        // check empty username, email, or password
        if (!username || !email || !password)
            throw new Error("Empty username, email, or password");
        // check valid email
        const emailRegex = /^[A-Z0-9+_.-]+@[A-Z0-9.-]+$/i;
        if (!emailRegex.test(email))
            throw new Error("Invalid email");
        // check existing email
        const q1 = "SELECT * FROM users WHERE email = $1";
        const v1 = [email];
        const result = yield db_1.default.query(q1, v1);
        const emails = result.rows;
        if (emails.length !== 0)
            throw new Error("Email already exists");
        // sign up user
        const uid = (0, uuid_1.v4)();
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(password, salt);
        const avatar = "https://firebasestorage.googleapis.com/v0/b/lelong-market.appspot.com/o/avatar.png?alt=media&token=a1c22e1a-1e37-4454-993c-9e8b045ccf5f";
        const q2 = "INSERT INTO users (uid, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5)";
        const v2 = [uid, username, email, hash, avatar];
        yield db_1.default.query(q2, v2);
        const token = jsonwebtoken_1.default.sign({ uid }, process.env.SECRET, { expiresIn: "3d" });
        res.status(200).json({ uid, username, token });
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to sign up user",
        });
    }
});
exports.signupUser = signupUser;
const signinUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // check empty email or password
        if (!email || !password)
            throw new Error("Empty email or password");
        // check valid email
        const q = "SELECT * FROM users WHERE email = $1";
        const v = [email];
        const result = yield db_1.default.query(q, v);
        const user = result.rows[0];
        if (!user)
            throw new Error("Invalid credentials");
        // check valid password
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            throw new Error("Invalid credentials");
        // sign in user
        const username = user.username;
        const uid = user.uid;
        const token = jsonwebtoken_1.default.sign({ uid }, process.env.SECRET, { expiresIn: "3d" });
        res.status(200).json({ uid, username, token });
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to sign in user",
        });
    }
});
exports.signinUser = signinUser;
// @desc get user
// @route GET /api/users/:uid
// @access private 1
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const q = "SELECT * FROM users WHERE uid = $1";
        const v = [uid];
        const result = yield db_1.default.query(q, v);
        const user = result.rows[0];
        if (!user)
            throw new Error("User does not exist");
        res.status(200).json({
            uid: user.uid,
            username: user.username,
            avatar: user.avatar,
        });
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get user",
        });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid: routeUid } = req.params;
    const { password, avatar } = req.body;
    const uid = req.uid;
    try {
        const q1 = "SELECT * FROM users WHERE uid = $1";
        const v1 = [routeUid];
        let result = yield db_1.default.query(q1, v1);
        let user = result.rows[0];
        if (!user)
            throw new Error("User does not exist");
        if (user.uid !== uid)
            throw new Error("Update not authorised");
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            const hash = yield bcrypt_1.default.hash(password, salt);
            const q2 = "UPDATE users SET password = $1 WHERE uid = $2 RETURNING *";
            const v2 = [hash, uid];
            result = yield db_1.default.query(q2, v2);
            user = result.rows[0];
            res.status(200).json({
                uid: user.uid,
                username: user.username,
                avatar: user.avatar,
            });
        }
        if (avatar) {
            // update listing avatar
            const q2 = "UPDATE listings SET avatar = $1 WHERE uid = $2";
            const v2 = [avatar, uid];
            yield db_1.default.query(q2, v2);
            // update user avatar
            const q3 = "UPDATE users SET avatar = $1 WHERE uid = $2 RETURNING *";
            const v3 = [avatar, uid];
            result = yield db_1.default.query(q3, v3);
            user = result.rows[0];
            res.status(200).json({
                uid: user.uid,
                username: user.username,
                avatar: user.avatar,
            });
        }
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to update user",
        });
    }
});
exports.updateUser = updateUser;
const resetUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const q1 = "SELECT * FROM users WHERE email = $1";
        const v1 = [email];
        let result = yield db_1.default.query(q1, v1);
        let user = result.rows[0];
        if (!user)
            throw new Error("User does not exist");
        const resetPassword = (0, uuid_1.v4)();
        const salt = yield bcrypt_1.default.genSalt(10);
        const hash = yield bcrypt_1.default.hash(resetPassword, salt);
        const status = yield (0, sendEmail_1.sendEmail)(email, resetPassword);
        if (status === "error")
            throw new Error("Unable to send email");
        const q2 = "UPDATE users SET password = $1 WHERE email = $2 RETURNING *";
        const v2 = [hash, email];
        result = yield db_1.default.query(q2, v2);
        user = result.rows[0];
        res.status(200).json({
            uid: user.uid,
            username: user.username,
            avatar: user.avatar,
        });
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to reset user",
        });
    }
});
exports.resetUser = resetUser;
