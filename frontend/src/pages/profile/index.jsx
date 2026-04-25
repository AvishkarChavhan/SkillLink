import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import Styles from "./index.module.css";

import { BaseUrl, clientServer } from "@/config";
import { getAboutUser } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalopen,setismodalopen]=useState(false);
  const [inputData,setinputData]=useState({company:"",position:"",years:""});

  const handleWorkChange=(e)=>{
      const {name ,value}=e.target;
      setinputData({...inputData,[name]:value})
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(getAllPosts());
    }
  }, []);

  useEffect(() => {
    setUserProfile(authState.user || {});
  }, [authState.user]);

  useEffect(() => {
    if (authState.user?.user && postReducer.posts.length > 0) {
      const filteredPosts = postReducer.posts.filter(
        (post) => post.userId.username === authState.user.user.userId.username
      );
      setUserPosts(filteredPosts);
    }
  }, [postReducer.posts, authState.user]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));
    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateProfileData = async () => {
    const request = await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.name,
    });

    const reponse = await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost,
      pastWork: userProfile.pastWork,
      education: userProfile.education,
    });
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {userProfile?.userId && (
          <div className={Styles.Container}>
            <div className={Styles.backDropContainer}>
              <label
                htmlFor="profilePictureUpload"
                className={Styles.backDrop__overlay}
              >
                <p>Edit</p>
              </label>
              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                }}
                type="file"
                id="profilePictureUpload"
                style={{ display: "none" }}
              />
              <img
                src={`${BaseUrl}/${userProfile?.userId?.profilePicture}`}
                alt="profile_img"
              />
            </div>

            <div className={Styles.profileContainer_details}>
              <div style={{ display: "flex", gap: "0.1rem" }}>
                <div style={{ flex: "0.6" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "fit-content",
                      gap: "2em",
                      marginBottom: "0.5em",
                    }}
                  >
                    <input
                      className={Styles.nameEdit}
                      type="text"
                      value={userProfile?.userId?.name}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    ></input>
                    <p style={{ color: "grey" }}>
                      <i>@{userProfile?.userId?.username}</i>
                    </p>
                  </div>

                  <div className={Styles.User_bio}>
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => {
                        setUserProfile({ ...userProfile, bio: e.target.value });
                      }}
                      rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))}
                    ></textarea>
                  </div>

                  <div className={Styles.workHistory}>
                    <h4>Work History</h4>
                    <button
                      className={Styles.addWorkButton}
                      onClick={() => {
                        // Your logic to add a new work entry
                        setismodalopen(true)
                      }}
                    >
                      + Add Work
                    </button>
                    <div className={Styles.singleCard}>
                      {userProfile?.pastWork?.length > 0 ? (
                        userProfile.pastWork.map((work, index) => (
                          <div key={index} className={Styles.workHistoryCard}>
                            <p
                              style={{
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.8rem",
                              }}
                            >
                              {work.company} - {work.position}
                            </p>
                            {work.years !== 0 && <p>{work.years}</p>}
                          </div>
                        ))
                      ) : (
                        <p>No work history available.</p>
                      )}
                    </div>
                  </div>
                  {userProfile != authState.user && (
                    <div
                      onClick={() => {
                        updateProfileData();
                      }}
                      className={Styles.updateBtn}
                    >
                      Update
                    </div>
                  )}
                </div>

                <div
                  style={{
                    flex: "0.4",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <p>
                    <b>Recent activity</b>
                  </p>
                  {userPosts.map((post) => (
                    <div key={post._id} className={Styles.postCard}>
                      <div className={Styles.card}>
                        <div className={Styles.cardProfileContainer}>
                          {post.media !== "" ? (
                            <img src={`${BaseUrl}/${post.media}`} alt="image" />
                          ) : (
                            <div
                              style={{
                                width: "3.4rem",
                                height: "3.4rem",
                              }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {isModalopen  && (
          <div
            onClick={() => {
              setismodalopen(false);
            }}
            className={Styles.commentsContainer}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={Styles.allCommentsContainer}
            ><input
                    onChange={handleWorkChange}
                    name="company"
                    className={Styles.inputfield}
                    type="text"
                    placeholder="Enter Company"
                  />
                  <input
                    onChange={handleWorkChange}
                    className={Styles.inputfield}
                    name="position"
                    type="text"
                    placeholder="Enter postition"
                  />
                  <input
                    onChange={handleWorkChange}
                    name="years"
                    className={Styles.inputfield}
                    type="number"
                    placeholder="years"
                  />
                  <div className={Styles.updateBtn} onClick={()=>{
                    setUserProfile({...userProfile,pastWork:[...(userProfile.pastWork ||[]),inputData]})
                    setismodalopen(false);
                  }}>Add work</div></div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
