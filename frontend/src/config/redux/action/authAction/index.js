import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/login", {
                email: user.email,
                password: user.password

            });
            if (response.data.token) {
                localStorage.setItem("token", response.data.token)
            } else {
                return thunkAPI.rejectWithValue({
                    message: "token not provided"

                })
            }
            return thunkAPI.fulfillWithValue(response.data.token);



        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }

    }
)

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const request = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password,
      });

      // ✅ Save token to localStorage if it's included in response
      if (request.data.token) {
        localStorage.setItem("token", request.data.token);
        return thunkAPI.fulfillWithValue({
          message: "Registration successful",
          token: request.data.token,
        });
      } else {
        return thunkAPI.rejectWithValue({
          message: "Token not received during registration",
        });
      }

    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: "Registration failed" });
    }
  }
);


export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.get("/get_user_and_profile", {
                params: {
                    token: user.token,
                },
            });

            // ✅ Extract and return only the user part
            return thunkAPI.fulfillWithValue(response.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async (_, thunkAPI) => {
        try {
            const response=await clientServer.get("/user/get_all_users");
            
            return response.data.Profiles;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)


export const sendConnectionRequest=createAsyncThunk(
  "user/sendConnectionRequest",
  async(user,thunkAPI)=>{
    try{
      const response=await clientServer.post("/user/send_connection_request",{
        token:user.token,
        connectionId:user.connectionId
      })
      thunkAPI.dispatch(getConnectionsRequest({token:user.token}))
      return thunkAPI.fulfillWithValue(response.data);
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data)
    }
  }
)

export const getConnectionsRequest=createAsyncThunk(
  "user/getConnectionsRequests",
  async(user,thunkAPI)=>{
    try{
      const response=await clientServer.get("/user/get_connection_request",{
        params:{
          token:user.token
        }
      })
      //console.log(response.data)
      return thunkAPI.fulfillWithValue(response.data.connections)

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data)
    }

  }
)

export const getMyconnectionRequests=createAsyncThunk(
  "user/getMyConnectionRequests",
  async(user,thunkAPI)=>{
    try{
      const response=await clientServer.get("/user/user_connection_request",{
        params:{
          token:user.token
        }
      })
      console.log(response.data)
      return thunkAPI.fulfillWithValue(response.data)
    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data.message)
    }
  }
)


export const AcceptConnection=createAsyncThunk(
  "user/acceptConnection",
  async(user,thunkAPI)=>{
    try{
      const response=await clientServer.post("/user/accept_connection_request",{
        token:user.token,
        requestId:user.connectionId,
        action_type:user.action,


      })
      return thunkAPI.fulfillWithValue(response.data)

    }catch(err){
      return thunkAPI.rejectWithValue(err.response.data)
    }
  }
)