import { Request } from "express";

export interface PrivateRequest extends Request {
  uid?: string;
  username?: string;
  email?: string;
  avatar?: string;
}
