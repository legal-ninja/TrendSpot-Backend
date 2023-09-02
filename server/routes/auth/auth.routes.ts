import { Router } from "express";
import { register } from "../../controllers/auth/register/register.controller";
import { signin } from "../../controllers/auth/signin/signin.controller";
import { forgotPassword } from "../../controllers/auth/forgot_password/forgot.password.controller";
import { resetPassword } from "../../controllers/auth/reset_password/reset.password.controller";
import { verifyAccountStatus } from "../../middleware/account.status";

const router = Router();

router.post("/register", register);
router.post("/signin", signin);
router.post("/forgot-password", verifyAccountStatus, forgotPassword);
router.post("/reset-password/:token", verifyAccountStatus, resetPassword);

export default router;
