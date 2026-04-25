import User from "../models/users.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcryptjs";

import crypto from "crypto";
import PDFdocument from "pdfkit";
import path from "path";
import fs from "fs";
import ConnectionRequest from "../models/connection.model.js";


const convertUserDataTOPDF = (userData) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFdocument();
        const filename = crypto.randomBytes(16).toString("hex") + ".pdf";
        const uploadDir = path.join(process.cwd(), "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        const outputPath = path.join(uploadDir, filename);
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const imagePath = path.join(uploadDir, userData.userId.profilePicture);
        if (fs.existsSync(imagePath)) {
            const pageWidth = doc.page.width;
            const imageWidth = 100;
            const x = (pageWidth - imageWidth) / 2;
            doc.image(imagePath, x, doc.y, { width: imageWidth });
            doc.moveDown(2); // add spacing below image
        }

        
        doc.fontSize(14).text(`Name: ${userData.userId.name}`);
        doc.moveDown(1);
        doc.text(`Username: ${userData.userId.username}`);
        doc.moveDown(1);
        doc.text(`Email: ${userData.userId.email}`);
        doc.moveDown(1);
        doc.text(`Bio: ${userData.bio}`);
        doc.moveDown(1);
        doc.text(`Current Post: ${userData.currentPost}`);
        doc.moveDown(1);
        doc.text("Past Work:");
        doc.moveDown(1);
        userData.pastWork.forEach((work) => {
            doc.text(`  Company: ${work.company}`);
            doc.moveDown(1);
            doc.text(`  Position: ${work.position}`);
            doc.moveDown(1);
            doc.text(`  Years: ${work.years}`);
            doc.moveDown(1);
        });


        doc.end();

        stream.on("finish", () => {
            resolve(filename);
        });

        stream.on("error", (err) => {
            reject(err);
        });
    });
};


export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        if (!name || !email || !password || !username) return res.status(400).json({ message: "All fields are required " });
        const user = await User.findOne({
            email
        });
        if (user) return res.status(400).json({ message: "user already exits " });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
        });
        await newUser.save();
        const profile = new Profile({ userId: newUser._id });
        await profile.save();
        return res.json({ message: "user created " });


    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

};
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "all fields are required" });
        const user = await User.findOne({
            email
        });
        if (!user) return res.status(404).json({ message: "User does not exist " });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credintials" });
        const newtoken = crypto.randomBytes(32).toString("hex");
         user.token = newtoken;
         await user.save();
       // await User.updateOne({ _id: user._id }, { token });
        return res.json({ token:newtoken });

    } catch (err) {

    }
};


export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;
    // console.log(token);
    //  console.log(req.file);
    try {

        const user = await User.findOne({ token });
        //console.log(user);
        if (!user) return res.status(404).json({ message: "User not found" });
        //console.log(req.file.filename);
        user.profilePicture = req.file.filename;
        await user.save();
        return res.json({ message: "profile picture updated " });


    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;
        const user = await User.findOne({ token });
        if (!user) return res.status(404).json({ message: "user does not exist" })
        const { username, email } = newUserData;
        const exitingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (exitingUser) {
            if (exitingUser || String(exitingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "user already exist" })
            }
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.json({ message: "user updated " });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("Received token:", token); // ✅ debug

    const user = await User.findOne({ token });
    console.log("Found user:", user); // ✅ debug

    if (!user) {
      return res.status(404).json({ message: "User Not found " });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    return res.json({ user: userProfile });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;

        const userProfile = await User.findOne({ token });
        if (!userProfile) return res.status(404).json({ message: "user does not Exist " });

        const profile_to_update = await Profile.findOne({ userId: userProfile._id });
        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();
        return res.json({ message: "Profile Updated" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getAllUsersProfiles = async (req, res) => {
    try {
        const Profiles = await Profile.find().populate("userId", "name username email profilePicture")
        return res.json({ Profiles });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


export const downloadProfileResume = async (req, res) => {
    try {
        const user_id = req.query.id;
       // console.log(req.query.id);
        const userProfile = await Profile.findOne({ userId: user_id }).populate(
            "userId",
            "name username email profilePicture"
        );

        if (!userProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const filename = await convertUserDataTOPDF(userProfile);

        res.json({ message: filename });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const sendConnectionRequest = async (req, res) => {
    try {
        const { token, connectionId } = req.body;
        console.log(token, connectionId);
        const user = await User.findOne({ token });

        if (!user) return res.status(404).json({ message: "User does not exist " });

        const connectionUser = await User.findOne({ _id: connectionId });
        console.log(connectionUser);
        if (!connectionUser) return res.status(404).json({ message: "connectionUser  not found " });
        const exitingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: connectionUser._id,
        })
        if (exitingRequest) {
            return res.status(404).json({ message: "request already send " });
        }
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id,
        })
        await request.save();
        return res.json({ message: "request send " });




    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getMyconnectionRequests = async (req, res) => {
    try {

        const { token } = req.query;
        //console.log("from the get my connection !!!!",token);
        const user = await User.find({ token});
        //console.log("get my connection from",user);
        if (!user) return res.status(404).json({ message: "User not Found " });

        const connections = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture');
        console.log(connections);
        return res.json({ connections });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const whatAreMyConnections = async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ token });
        console.log("from the what are my the connection ",user)
        if (!user) return res.status(404).json({ message: "User not Found " });
        const connections = await ConnectionRequest.find({ connectionId: user._id })
            .populate('userId', 'name username email profilePicture')
            .populate("connectionId", "name username email profilePicture");
        console.log("connections :",connections)
        return res.json(connections);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { token, requestId, action_type } = req.body;


        const user = await User.findOne({ token });
        if (!user) 
            return res.status(404).json({ message: "User not Found " });

        const connection=await ConnectionRequest.findOne({_id:requestId});
        if (!connection) 
            return res.status(404).json({ message: "connection not Found " });

        if(action_type === "accept"){
            connection.status_accepted=true;
        }else{
            connection.status_accepted=false;
        }
        await connection.save();
        return res.json({ message: "Connection Request Accepted" });

        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export const getUserProfileAndUserBasedonUsername=async(req,res)=>{
    try{
        const {username}=req.query;
        console.log(username);
        const user=await User.findOne({username})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const  userProfile=await Profile.findOne({userId:user._id}).populate("userId","name username email profilePicture")
        return res.json({userProfile});

    }catch(err){
        return res.status(500).json({message:"Username based profile"})
    }
}