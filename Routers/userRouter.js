const router = require('express').Router();
const { signUp, verifyOtp, login, welcome, getUsers } = require('../Controllers/userController');

router.route('/signup')
    .post(signUp);
router.route('/signup/verify')
    .post(verifyOtp);
router.route("/login").post(login); 
router.route("/login/verify").post(verifyOtp);
router.route("/getall").get(getUsers);

module.exports = router;