import { Router } from "express";


import { rateLimit } from "../middleware/errors.js";
import {
  validate,
  id,
  credentials,
  listingRules,
  makeListingRules,
  pageRules,
  body,
} from "../validators/index.js";
import { respond } from "../controllers/http.js";
import { authService } from "../services/auth.js";


import { publicUser } from "../utils/errors.js";
export function routes(dependencies) {
const router = Router();
const account = authService(dependencies);
const authLimit = rateLimit();
router.post(
    "/auth/signup",
    authLimit,
    validate([...credentials, body("name").isString().trim().isLength({ min: 2, max: 80 })]),
    respond((req) => account.signup(req.body), 201),
  );
router.post(
    "/auth/verify",
    authLimit,
    validate([body("email").isEmail().normalizeEmail(), body("code").matches(/^\d{6}$/)]),
    respond((req) => account.verify(req.body)),
  );
router.post(
    "/auth/resend",
    authLimit,
    validate([body("email").isEmail().normalizeEmail()]),
    respond((req) => account.resend(req.body)),
  );
router.post(
    "/auth/login",
    authLimit,
    validate(credentials),
    respond((req) => account.login(req.body)),
  );
return router;
}
const pickAd = (body) =>
  Object.fromEntries(
    ["title", "description", "price", "city", "category", "condition"]
      .filter((key) => body[key] !== undefined)
      .map((key) => [key, body[key]]),
  );