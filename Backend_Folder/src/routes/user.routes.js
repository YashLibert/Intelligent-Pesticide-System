import { Router } from "express"
import { registerUser, logedinUser, loggedOut } from "../controllers/user.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(logedinUser)
router.route("/logout").post(verifyJWT, loggedOut)









export default router