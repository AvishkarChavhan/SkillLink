import NavBarComponent from "@/components/navbar";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [userLoginMethod, setUserLoginMethod] = useState(false);
  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  // ✅ redirect if authState.LoggedIn becomes true
  useEffect(() => {
    if (authState.LoggedIn) {
      router.push("/dashboard");
    }
  }, [authState.LoggedIn, router]);

  // ✅ Check only valid token after login succeeds, not before
  // ✅ Remove stale token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !authState.LoggedIn) {
      localStorage.removeItem("token");
    }
  }, []);

  const handleRegister = () => {
    dispatch(registerUser({ username, name, email, password }));
  };

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  return (
    <UserLayout>
      <div className={Styles.container}>
        <div className={Styles.cardContainer}>
          <div className={Styles.mainContainer_left}>
            <p className={Styles.cardLeftHeading}>
              {userLoginMethod ? "Sign in" : "Sign Up"}
            </p>
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {authState?.message?.message}
            </p>

            <div className={Styles.inputContainers}>
              {!userLoginMethod && (
                <div className={Styles.inputRow}>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    className={Styles.inputfield}
                    type="text"
                    placeholder="Username"
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    className={Styles.inputfield}
                    type="text"
                    placeholder="Name"
                  />
                </div>
              )}

              <input
                onChange={(e) => setEmailAddress(e.target.value)}
                className={Styles.inputfield}
                type="email"
                placeholder="Email"
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                className={Styles.inputfield}
                type="password"
                placeholder="Password"
              />
              <div
                className={Styles.buttonWithOutLined}
                onClick={() => {
                  userLoginMethod ? handleLogin() : handleRegister();
                }}
              >
                <p>{userLoginMethod ? "Sign in" : "Sign Up"}</p>
              </div>
            </div>
          </div>
          <div className={Styles.mainContainer_right}>
            <div>
              <p>
                {userLoginMethod
                  ? "Don't have an Account ?"
                  : "Already have an Account?"}
              </p>
              <div
                className={Styles.buttonWithOutLined}
                onClick={() => {
                  setUserLoginMethod(!userLoginMethod);
                }}
              >
                <p>{userLoginMethod ? "Sign up" : "Sign in"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
