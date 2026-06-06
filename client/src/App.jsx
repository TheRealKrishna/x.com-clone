import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Landing from "./Pages/Landing";
import Index from "./Pages/home/Index";
import Logout from "./Pages/Logout";
import { GOOGLE_CLIENT_ID, hasGoogle } from "./api/config";

// Wrap with GoogleOAuthProvider only when a client ID is configured; otherwise
// the provider throws. Email/password auth works without it.
function withGoogle(children) {
  if (!hasGoogle) return children;
  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" reverseOrder={true} />
      {withGoogle(
        <Routes>
          {/* Public landing + auth flows */}
          <Route path="/" element={<Landing />} />
          <Route path="/i/flow/signup" element={<Landing />} />
          <Route path="/i/flow/login" element={<Landing />} />

          {/* Authenticated app shell — Index renders the right panel by route */}
          <Route path="/home" element={<Index view="home" />} />
          <Route path="/explore" element={<Index view="explore" />} />
          <Route path="/search" element={<Index view="explore" />} />
          <Route path="/notifications" element={<Index view="notifications" />} />
          <Route path="/bookmarks" element={<Index view="bookmarks" />} />
          <Route path="/messages" element={<Index view="messages" />} />
          <Route path="/messages/:_id" element={<Index view="messages" />} />
          <Route path="/settings/profile" element={<Index view="profile" />} />
          <Route path="/status/:postId" element={<Index view="post" />} />
          <Route path="/:username" element={<Index view="profile" />} />
          <Route path="/:username/followers" element={<Index view="connections" />} />
          <Route path="/:username/verified_followers" element={<Index view="connections" />} />
          <Route path="/:username/following" element={<Index view="connections" />} />

          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
