import { resetPasswordController, resetPasswordRequestController } from "../controllers/auth.controller";

const router = require("express").Router();

router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/password-reset", resetPasswordController); 

export default router;
