import { BaseUrl, clientServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import Styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionsRequest,
  getMyconnectionRequests,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [userPosts, setUserPosts] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("none");

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionsRequest({ token: localStorage.getItem("token") })
    );
    await dispatch(
      getMyconnectionRequests({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    // ✅ Added null check for post.userId before accessing .username
    const posts = postReducer.posts.filter(
      (post) =>
        post.userId !== null &&
        post.userId.username === router.query.username
    );
    setUserPosts(posts);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    const viewedUserId = userProfile?.userId?._id;
    const { connections = [], connectionRequest = [] } = authState;

    const isConnected = connections.find(
      (conn) =>
        (conn.userId?._id === viewedUserId ||
          conn.connectionId?._id === viewedUserId) &&
        conn.status_accepted
    );

    const isPending =
      connectionRequest.find(
        (conn) =>
          conn.connectionId?._id === viewedUserId && !conn.status_accepted
      ) ||
      connections.find(
        (conn) =>
          (conn.userId?._id === viewedUserId ||
            conn.connectionId?._id === viewedUserId) &&
          !conn.status_accepted
      );

    if (isConnected) setConnectionStatus("connected");
    else if (isPending) setConnectionStatus("pending");
    else setConnectionStatus("none");
  }, [authState.connections, authState.connectionRequest, userProfile?.userId?._id]);

  useEffect(() => {
    getUsersPost();
  }, []);

  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ padding: "2rem" }}>User not found.</div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={Styles.Container}>
          <div className={Styles.backDropContainer}>
            <img
              src={`${BaseUrl}/${userProfile.userId?.profilePicture ?? ""}`}
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
                  <h4>{userProfile.userId?.name ?? "Unknown User"}</h4>
                </div>

                {connectionStatus === "connected" && (
                  <button className={Styles.connected_button}>Connected</button>
                )}

                {connectionStatus === "pending" && (
                  <button className={Styles.connected_button}>Pending</button>
                )}

                {connectionStatus === "none" && (
                  <button
                    onClick={async () => {
                      setIsSending(true);
                      await dispatch(
                        sendConnectionRequest({
                          token: localStorage.getItem("token"),
                          connectionId: userProfile.userId?._id,
                        })
                      );
                      await getUsersPost();
                      setIsSending(false);
                    }}
                    className={Styles.connectbtn}
                  >
                    {isSending ? "Sending..." : "Connect"}
                  </button>
                )}

                <div
                  onClick={async () => {
                    const response = await clientServer.get(
                      `/user/download_resume?id=${userProfile.userId?._id}`
                    );
                    window.open(`${BaseUrl}/${response.data.message}`, "_blank");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    style={{ width: "1.5rem" }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                    />
                  </svg>
                </div>

                <div className={Styles.User_bio}>
                  <p>{userProfile.bio}</p>
                </div>

                <div className={Styles.workHistory}>
                  <h4>Work History</h4>
                  <div className={Styles.singleCard}>
                    {userProfile.pastWork?.map((work, index) => (
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
                        {work.years !== 0 ? <p>{work.years}</p> : <p></p>}
                      </div>
                    ))}
                  </div>
                </div>
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
                          <img
                            src={`${BaseUrl}/${post.media}`}
                            alt="image"
                          />
                        ) : (
                          <div
                            style={{ width: "3.4rem", height: "3.4rem" }}
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
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const { username } = context.query;
    const response = await clientServer.get(
      "/user/get_profile_based_on_username",
      {
        params: { username },
      }
    );

    const profile = response.data.userProfile;
    const sanitizedProfile = JSON.parse(
      JSON.stringify(profile, (_, value) => (value === undefined ? null : value))
    );

    return {
      props: {
        userProfile: sanitizedProfile,
      },
    };
  } catch (error) {
    return {
      props: {
        userProfile: null,
      },
    };
  }
}