const { body, validationResult } = require("express-validator");
const httpStatus = require("../constants/httpStatus");

const loginValidation = [
    body("email")
        .trim()
        .isEmail().withMessage("Valid email required")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

    (req, res, next) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({
                error: {
                    code: httpStatus.BAD_REQUEST,
                    message: "Login validation failed",
                    errors: result.array(),
                }
            });
        }

        next();
    }
];

const signupValidation = [

];

module.exports = {
    loginValidation,
};