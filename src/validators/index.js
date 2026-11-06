import { body, param, query, validationResult } from "express-validator";
import { AppError } from "../utils/errors.js";
export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    if (!validationResult(req).isEmpty())
      throw new AppError(422, "Invalid input; check required fields and limits");
    next();
  },
];
export const id = (name = "id") => param(name).isMongoId();
export const credentials = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 12, max: 72 })
    .custom((v) => Buffer.byteLength(v) <= 72),
];
export const makeListingRules = (partial = false) => {
  const rules = [
    body("title").isString().trim().isLength({ min: 5, max: 100 }),
    body("description").isString().trim().isLength({ min: 20, max: 3000 }),
    body("price").isFloat({ min: 1, max: 1e9 }).toFloat(),
    body("city").isString().trim().isLength({ min: 2, max: 80 }),
    body("category").isMongoId(),
    body("condition").optional().isIn(["new", "used"]),
  ];
  return partial ? rules.map((rule) => rule.optional()) : rules;
};
export const listingRules = makeListingRules();

export const pageRules = [
  query("page").optional().isInt({ min: 1, max: 1000 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("q").optional().isString().isLength({ max: 100 }),
  query("condition").optional().isIn(["new", "used"]),
  query("city").optional().isString().isLength({ max: 80 }),
  query("category").optional().isMongoId(),
  query("minPrice").optional().isFloat({ min: 0, max: 1e9 }).toFloat(),
  query("maxPrice").optional().isFloat({ min: 0, max: 1e9 }).toFloat(),
  query("sort").optional().isIn(["newest", "price-asc", "price-desc"]),
];
export { body };
