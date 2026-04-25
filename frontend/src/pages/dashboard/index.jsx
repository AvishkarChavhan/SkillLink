import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLike,
  postComment,
} from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./index.module.css";
import { resetPostId } from "@/config/redux/reducer/postReducer";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.postReducer);

  const [tokenChecked, setTokenChecked] = useState(false);
  const [postContent, setpostContent] = useState("");
  const [fileContent, setfileContent] = useState();
  const [commentText, setCommentText] = useState("");

  const handleUpload = async () => {
    try {
      const result = await dispatch(
        createPost({ file: fileContent, body: postContent })
      );
      setfileContent(null);
      setpostContent("");
      dispatch(getAllPosts());
    } catch (err) {
      console.error("Dispatch error:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        const result = await dispatch(getAboutUser({ token }));
        if (result.meta.requestStatus === "rejected") {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        await dispatch(getAllPosts());
        setTokenChecked(true);
        if (!authState.all_profiles_fetched) {
          dispatch(getAllUsers());
        }
      } catch (error) {
        console.error("Token verification failed", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    };
    fetchData();
  }, [dispatch, router]);

  if (!tokenChecked) return <p>Checking login...</p>;
  if (!authState.profileFetched) return <p>Loading profile...</p>;

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={Styles.scrollComponent}>
            <div className={Styles.wrapper}>
              <div className={Styles.createPostContainer}>
                {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                <img
                  className={Styles.userProfile}
                  src={authState.user.userId?.profilePicture ?? ""}
                  alt="user profile"
                />
                <textarea
                  onChange={(e) => setpostContent(e.target.value)}
                  value={postContent}
                  placeholder="What's in your mind ?"
                ></textarea>
                <label htmlFor="fileupload">
                  <div className={Styles.Fab}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                </label>
                <input
                  onChange={(e) => setfileContent(e.target.files[0])}
                  type="file"
                  hidden
                  id="fileupload"
                />
                {postContent.length > 0 && (
                  <div onClick={handleUpload} className={Styles.uploadButton}>
                    Post
                  </div>
                )}
              </div>

              <div className={Styles.postsContainer}>
                {postState.posts
                  .filter((post) => post.userId !== null)
                  .map((post) => {
                    return (
                      <div key={post._id} className={Styles.singleCard}>
                        <div className={Styles.Profile_block}>
                          <div className={Styles.singleCard_profileContainer}>
                            {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                            <img
                              className={Styles.postUserProfile}
                              src={post.userId?.profilePicture ?? ""}
                              alt="user img"
                            />
                          </div>
                          <div className={Styles.Profile_trash}>
                            <div className={Styles.NameBlock}>
                              <p style={{ fontWeight: "bold" }}>
                                {post.userId?.name ?? "Deleted User"}
                              </p>
                              <p style={{ color: "grey" }}>
                                @{post.userId?.username ?? "unknown"}
                              </p>
                              <p className={Styles.timestamp}>
                                {new Date(post.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className={Styles.Delete_button}>
                              {post.userId?._id === authState.user.userId._id && (
                                <div
                                  className={Styles.Name_trash}
                                  onClick={async () => {
                                    const confirmed = window.confirm("Are you sure you want to delete this post?");
                                    if (confirmed) {
                                      await dispatch(deletePost(post._id));
                                      await dispatch(getAllPosts());
                                    }
                                  }}
                                >
                                  <svg style={{ width: "20px" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ paddingTop: "0.3rem", marginBottom: "1rem", marginInlineStart: "2rem" }}>
                          <p>{post.body}</p>
                        </div>

                        {post.media && (
                          <div className={Styles.mediaContainer}>
                            {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                            <img
                              className={Styles.postImage}
                              src={post.media}
                              alt="Post Media"
                            />
                          </div>
                        )}

                        <div className={Styles.ReactSection}>
                          <div className={Styles.Option_react} onClick={() => {
                            dispatch(incrementPostLike({ post_id: post._id })).then(() => dispatch(getAllPosts()));
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                            </svg>
                            {post.likes}
                          </div>

                          <div className={Styles.Option_react} onClick={() => {
                            dispatch(getAllComments({ post_id: post._id }));
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                          </div>

                          <div className={Styles.Option_react} onClick={() => {
                            const text = encodeURIComponent(post.body);
                            const url = encodeURIComponent(`${post.userId?.username ?? ""}`);
                            const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                            window.open(twitterUrl, "_blank");
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                            </svg>
                          </div>
                        </div>

                        {postState.postId !== "" && (
                          <div onClick={() => { dispatch(resetPostId()); }} className={Styles.commentsContainer}>
                            <div onClick={(e) => e.stopPropagation()} className={Styles.allCommentsContainer}>
                              {postState.comments.length === 0 && <h2>No comments</h2>}
                              {postState.comments.length !== 0 &&
                                postState.comments.map((comment, index) => (
                                  <div key={comment._id} className={Styles.outerCommentBox}>
                                    <div className={Styles.innerCommentBox}>
                                      {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                                      <img
                                        className={Styles.commentCardProfile}
                                        src={comment.userId?.profilePicture ?? ""}
                                        alt="comment user img"
                                      />
                                      <p>@{comment.userId?.username ?? "unknown"}</p>
                                    </div>
                                    <div className={Styles.commentCard}>
                                      <p>{comment.body}</p>
                                    </div>
                                  </div>
                                ))}
                              <div className={Styles.postCommentsContainer}>
                                <input
                                  type="text"
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  placeholder="Comment"
                                />
                                <div
                                  className={Styles.postCommentsContainer_commentBtn}
                                  onClick={async () => {
                                    await dispatch(postComment({ post_id: postState.postId, body: commentText }));
                                    await dispatch(getAllComments({ post_id: postState.postId }));
                                    setCommentText("");
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading...</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }
}