import { randomInt, createHmac } from "node:crypto";
export const makeOtp = () => String(randomInt(100000, 1000000));
export const hashOtp = (email, code, secret) =>
  createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
