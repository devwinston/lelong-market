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
exports.sendEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmail = (email, resetPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const message = {
        to: email,
        from: {
            name: "Administrator @ Lelong Market",
            email: process.env.EMAIL,
        },
        subject: "Reset Password",
        text: `Please proceed to sign in with the following reset password: ${resetPassword}`,
        html: `<p>Please proceed to sign in with the following reset password: ${resetPassword}</p>`,
    };
    try {
        yield mail_1.default.send(message);
        return "success";
    }
    catch (error) {
        return "error";
    }
});
exports.sendEmail = sendEmail;
