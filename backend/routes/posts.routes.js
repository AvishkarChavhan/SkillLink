import { Router } from "express";
import { activecheck, commentPost, createPost, delete_comment_of_user, deletePost, get_comments_by_posts, getAllPosts, increment_likes } from "../controllers/posts.controller.js";
import { upload } from "../config/cloudinary.js"; // ✅ import from cloudinary

const router = Router();

router.route("/").get(activecheck);
router.route("/post").post(upload.single("media"), createPost); // ✅ same as before
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/getAllComments").get(get_comments_by_posts);
router.route("/comment").post(commentPost);
router.route("/delete_comment").delete(delete_comment_of_user);
router.route("/increment_like").post(increment_likes);

export default router;