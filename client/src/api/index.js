import { post } from "./http";

// Grouped API methods mirroring the backend routes. Each returns the parsed
// JSON ({ success, ... } | { success: false, error }).

export const authApi = {
  emailValidate: (email) => post("/auth/emailvalidate", { email }, { auth: false }),
  phoneValidate: (phone, country) => post("/auth/phonevalidate", { phone, country }, { auth: false }),
  signUpWithEmail: (data) => post("/auth/signupwithemail", data, { auth: false }),
  signUpWithPhone: (data) => post("/auth/signupwithphone", data, { auth: false }),
  loginValidate: (name, country) => post("/auth/loginvalidate", { name, country }, { auth: false }),
  login: (data) => post("/auth/login", data, { auth: false }),
  loginWithGoogle: (tokenResponse) => post("/auth/loginwithgoogle", tokenResponse, { auth: false }),
  me: () => post("/auth/getuserinfo"),
  getById: (_id) => post("/auth/getuserinfowithid", { _id }),
  getByUsername: (username) => post("/auth/getuserinfowithusername", { username }),
  editProfile: (data) => post("/auth/editprofile", data),
};

export const postApi = {
  getFeed: (filter) => post("/post/getposts", { filter }),
  getUserPosts: (_id, tab) => post("/post/getuserposts", { _id, tab }),
  getPost: (_id) => post("/post/getpost", { _id }),
  getBookmarks: () => post("/post/getbookmarks"),
  add: (data) => post("/post/addpost", data),
  reply: (_id, data) => post("/post/addreply", { _id, ...data }),
  addView: (_id) => post("/post/addview", { _id }),
  like: (_id) => post("/post/addlike", { _id }),
  unlike: (_id) => post("/post/removelike", { _id }),
  toggleRepost: (_id) => post("/post/togglerepost", { _id }),
  toggleBookmark: (_id) => post("/post/togglebookmark", { _id }),
  remove: (_id) => post("/post/deletepost", { _id }),
};

export const followApi = {
  add: (_id) => post("/follow/addfollower", { _id }),
  remove: (_id) => post("/follow/removefollower", { _id }),
  getFollowers: (_id) => post("/follow/getfollowers", { _id }),
  getFollowing: (_id) => post("/follow/getfollowing", { _id }),
  getSuggestions: (limit) => post("/follow/getsuggestions", { limit }),
};

export const chatApi = {
  getContacts: () => post("/chat/getcontacts"),
  getMessages: (_id) => post("/chat/getmessages", { _id }),
  addContact: (_id) => post("/chat/addcontact", { _id }),
  sendMessage: (_id, message) => post("/chat/sendmessage", { _id, message }),
};

export const exploreApi = {
  search: (query, type) => post("/explore/search", { query, type }),
  trends: () => post("/explore/trends"),
};

export const notificationApi = {
  get: () => post("/notification/get"),
  unreadCount: () => post("/notification/unreadcount"),
  markAllRead: () => post("/notification/markallread"),
};
