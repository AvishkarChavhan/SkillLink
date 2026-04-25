import { BaseUrl } from "@/config";
import { getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./index.module.css";
import { useRouter } from "next/router";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    console.log("Checking profiles fetched:", authState.all_profiles_fetched);
    if (!authState.all_profiles_fetched) {
      console.log("Dispatching getAllUsers()");
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div style={{ margin: "1rem" }}>
          <h1>My DiscoverPage</h1>
          <div className={Styles.allUserProfile}>
            {authState.all_profiles_fetched &&
            Array.isArray(authState.all_users) ? (
              authState.all_users
                // ✅ filter out profiles where userId is null
                .filter((profile) => profile.userId !== null)
                .map((profile) => (
                  <div
                    onClick={() => {
                      router.push(
                        `/view_profile/${encodeURIComponent(profile.userId?.username)}`
                      );
                    }}
                    key={profile._id}
                    className={Styles.userCard}
                  >
                    <img
                      className={Styles.userCard_img}
                      src={`${BaseUrl}/${profile.userId?.profilePicture ?? ""}`}
                      alt="profile img"
                    />
                    <div>
                      <h3>{profile.userId?.name ?? "Deleted User"}</h3>
                      <p>@{profile.userId?.username ?? "unknown"}</p>
                    </div>
                  </div>
                ))
            ) : (
              <p>Loading users...</p>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}