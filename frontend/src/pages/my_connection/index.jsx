import { AcceptConnection, getMyconnectionRequests } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./index.module.css";
import { useRouter } from "next/router";

export default function MyConnectionPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMyconnectionRequests({ token: localStorage.getItem("token") }));
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h4>Pending Requests</h4>
          {authState.connectionRequest?.length > 0 ? (
            authState.connectionRequest
              .filter((connection) => connection.userId !== null && connection.status_accepted == null)
              .map((conn, index) => (
                <div onClick={() => { router.push(`/view_profile/${conn.userId?.username}`); }} className={Styles.userCard} key={index}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "0.5rem" }}>
                    <div className={Styles.profilePicture}>
                      {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                      <img src={conn.userId?.profilePicture ?? ""} alt="profile image" />
                    </div>
                    <div className={Styles.userInfo}>
                      <h2>{conn.userId?.name ?? "Deleted User"}</h2>
                      <p>@{conn.userId?.username ?? "unknown"}</p>
                    </div>
                    <div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await dispatch(AcceptConnection({ connectionId: conn._id, token: localStorage.getItem("token"), action: "accept" }));
                          dispatch(getMyconnectionRequests({ token: localStorage.getItem("token") }));
                        }}
                        className={Styles.connectbtn}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p>No connection requests found</p>
          )}

          <h4>Accepted Connections</h4>
          {authState.connectionRequest?.length > 0 &&
            authState.connectionRequest
              .filter((connection) => connection.userId !== null && connection.status_accepted != null)
              .map((conn, index) => (
                <div onClick={() => { router.push(`/view_profile/${conn.userId?.username}`); }} className={Styles.userCard} key={index}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "0.5rem" }}>
                    <div className={Styles.profilePicture}>
                      {/* ✅ Cloudinary full URL - no BaseUrl prefix */}
                      <img src={conn.userId?.profilePicture ?? ""} alt="profile image" />
                    </div>
                    <div className={Styles.userInfo}>
                      <h2>{conn.userId?.name ?? "Deleted User"}</h2>
                      <p>@{conn.userId?.username ?? "unknown"}</p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}