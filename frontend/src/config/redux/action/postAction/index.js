import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/posts");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (userData, thunkAPI) => {
    try {
      const { file, body } = userData;
      const formData = new FormData();
      const token = localStorage.getItem("token");
      formData.append("body", body);
      if (file) {
        formData.append("media", file);
      }
      const response = await clientServer.post("/post", formData, {
        headers: {
          token: token,
        },
      });
      if (response.status === 200) {
        return thunkAPI.fulfillWithValue("Post Uploaded");
      } else {
        return thunkAPI.fulfillWithValue("Post Not Uploaded");
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (post_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_post", {
        data: {
          token: localStorage.getItem("token"),
          post_id,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const incrementPostLike = createAsyncThunk(
  "post/incrementLikes",
  async (post, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/increment_like",
        { post_id: post.post_id },
        {
          headers: {
            token: localStorage.getItem("token"), // ✅ send token for like check
          },
        }
      );
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get("/getAllComments", {
        params: {
          post_id: postData.post_id,
        },
      });
      return thunkAPI.fulfillWithValue({
        comments: response.data,
        post_id: postData.post_id,
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const postComment = createAsyncThunk(
  "post/postComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        post_id: commentData.post_id,
        commentBody: commentData.body,
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue("something went wrong");
    }
  }
);

// ✅ new delete comment action
export const deleteComment = createAsyncThunk(
  "post/deleteComment",
  async (comment_id, thunkAPI) => {
    try {
      const response = await clientServer.delete("/delete_comment", {
        data: {
          token: localStorage.getItem("token"),
          comment_id,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);