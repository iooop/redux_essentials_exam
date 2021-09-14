import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../../api/client";

const initialState = {
  posts: [],
  status: "idle",
  error: null
};

// createAsyncThunk第二个参数是"Payload creator"，返回的是action的payload
// fetchPosts在使用posts数据的地方（比如PostList组件的useEffect()中）使用，调用方式是dispatch(fetchPosts)
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await client.get("/fakeApi/posts");
  return response.data;
});

export const addNewPost = createAsyncThunk("posts/addNewPost", async (post) => {
  const response = await client.post("/fakeApi/posts", post);
  return response.data;
});

export const updatePost = createAsyncThunk("posts/updatePost", async (post) => {
  const response = await client.post(`/fakeApi/posts/${post.id}`, post, {
    method: "patch"
  });
  return response.data;
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload;
      const existingPost = state.posts.find((post) => post.id === postId);
      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },

    postUpdated(state, action) {
      const { id, title, content } = action.payload;
      const existingPost = state.posts.find((post) => post.id === id);
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
      }
    }
  },
  extraReducers: {
    [fetchPosts.pending]: (state, action) => {
      state.status = "loading";
    },
    [fetchPosts.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.posts = state.posts.concat(action.payload);
    },
    [fetchPosts.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [addNewPost.fulfilled]: (state, action) => {
      state.posts.push(action.payload);
    },
    [updatePost.fulfilled]: (state, action) => {
      const { id, title, content } = action.payload;
      const existingPost = state.posts.find((post) => post.id === id);
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
      }
    }
  }
});

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions;
export default postsSlice.reducer;

export const selectAllPosts = (state) => state.posts.posts;

export const selectPostById = (state, postId) =>
  state.posts.posts.find((post) => post.id === postId);
