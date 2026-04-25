import {
  getAboutUser,
  getAllUsers,
  getConnectionsRequest,
  getMyconnectionRequests,
  loginUser,
  registerUser,
  sendConnectionRequest,
} from "../../action/authAction";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  LoggedIn: false,
  message: "",
  isTokenThere: false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  all_users: [],
  all_profiles_fetched: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => ({ ...initialState }),
    handleLoginUser: (state) => {
      state.message = "hello ";
    },
    emptyMessage: (state) => {
      state.message = "";
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "knocking the door.....";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.LoggedIn = true;
        state.message = "login is successfully";

        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = {
          message: "Login failed",
        };
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you.....";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.LoggedIn = true;
        state.message = {
          message: "Registration is successful  please logged in",
        };
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = {
          message: "All fields are required",
        };
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.user;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        (state.isLoading = false),
          (state.isError = false),
          (state.all_profiles_fetched = true),
          (state.all_users = action.payload);
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections = action.payload || [];
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message = action.payload;
      })
      .addCase(getMyconnectionRequests.fulfilled, (state, action) => {
        state.connectionRequest = action.payload;
      })
      .addCase(getMyconnectionRequests.rejected, (state, action) => {
        state.message = action.payload || "something went wrong";
      })
      .addCase(sendConnectionRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = "Connection request sent";
      })
      .addCase(sendConnectionRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message =
          action.payload?.message || "Failed to send connection request";
      });
  },
});
export const { reset, emptyMessage, setTokenIsThere, setTokenIsNotThere } =
  authSlice.actions;
export default authSlice.reducer;
