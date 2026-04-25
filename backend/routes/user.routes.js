import { Router } from "express";
import { Login, register, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUsersProfiles, downloadProfileResume, sendConnectionRequest, getMyconnectionRequests, whatAreMyConnections, acceptConnectionRequest, getUserProfileAndUserBasedonUsername } from "../controllers/user.controller.js";
import { upload } from "../config/cloudinary.js"; // ✅ import from cloudinary

const router = Router();

router.route("/update_profile_picture").post(upload.single("profile_picture"), uploadProfilePicture);
router.route("/register").post(register);
router.route("/login").post(Login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUsersProfiles);
router.route("/user/download_resume").get(downloadProfileResume);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/get_connection_request").get(getMyconnectionRequests);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedonUsername);

export default router;