import User from "../models/users.model.js";
import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import bcrypt from "bcryptjs";
import multer from "multer";



export const activecheck = async (req, res) => {
    return res.status(200).json({ message: "currently running from active check " });

};



export const createPost = async (req, res) => {
    try {
        const token  = req.headers.token;
       // console.log("this is the route token ",token)
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
       // console.log(req.body)

        console.log()
        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: req.file != undefined ? req.file.filename : "",
            fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
        });

        await post.save();
        return res.status(200).json({ message: "Post created successfully" });


    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({}).populate("userId", "name username email profilePicture");
        return res.json({ posts });


    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const deletePost = async (req, res) => {
    const { token, post_id } = req.body;
    try {
        const user = await User.findOne({ token })
        if (!user) return res.status(404).json({ message: "user not found" });

        const post = await Post.findOne({ _id: post_id })
        if (!post) return res.status(404).json({ message: "post not found" });
        if (post.userId.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });

        }
        await Post.deleteOne({ _id: post_id });
        return res.json({ message: 'post is deleted ' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const commentPost = async (req, res) => {
    try {
        const { token, post_id, commentBody } = req.body;

        const user = await User.findOne({ token: token }).select("_id");
        if (!user) return res.status(404).json({ message: "user not found" });


        const post = await Post.findOne({ _id: post_id });
        if (!post) return res.status(404).json({ message: "post not found" });

        const newcomment = new Comment({
            userId: user._id,
            postId: post_id,
            body: commentBody,

        })
        await newcomment.save()
        return res.status(200).json({ message: "comment added" })

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
export const get_comments_by_posts=async (req,res)=>{
    try{
        const {post_id}=req.query;
        console.log(post_id)
        const post=await Post.findOne({_id:post_id})
        if(!post)return res.status(404).json({message:"post not found"})
            const comments=await Comment.find({postId:post_id}).populate('userId',"username name")

        return res.json(comments.reverse())

    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}
export const delete_comment_of_user=async(req,res)=>{
    try{
        const {token,comment_id}=req.body;

        const user=await User.findOne({token}).select("_id");
        if(!user) return res.status(400).json({message:"user not found"});
        const comment=await Comment.findOne({_id:comment_id})
        if(!comment) return res.status(400).json({message:"comment not found"});
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(200).json({message:"Unauthorized"})

        }
        await comment.deleteOne({_id:comment_id})
        return res.json({message:"comment deleted"});


    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}

export const increment_likes=async(req,res)=>{
    try{
        const {post_id}=req.body;
        const post=await Post.findOne({_id:post_id});
        if(!post)return res.status(404).json({message:"post not found"})
        post.likes=post.likes+1;
        await post.save()
        return res.json({message:"like incremented"});

        
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}
