import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Styles from "../../css/Home/index.module.css";
import Menu from "./Components/Menu";
import Feed from "./Components/Home";
import Profile from "./Components/Profile";
import Connections from "./Components/Connections";
import Messages from "./Components/Messages";
import Explore from "./Components/Explore";
import Notifications from "./Components/Notifications";
import Bookmarks from "./Components/Bookmarks";
import PostDetail from "./Components/PostDetail";
import MobileMenu from "./Components/MobileMenu";
import RightPanel from "./Components/RightPanel";
import Loader from "../../Components/Loader";
import { authApi } from "../../api";
import { isLoggedIn, clearToken } from "../../api/config";
import { useRealtime } from "../../hooks/useRealtime";

/**
 * Authenticated app shell. The `view` prop (set per-route in App.jsx) decides
 * which panel renders in the center column — no more window.location sniffing.
 */
export default function Index({ view }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const json = await authApi.me();
    if (json.success) {
      setUser(json.user);
      return json.user;
    }
    clearToken();
    navigate("/i/flow/login");
    return null;
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/i/flow/login");
      return;
    }
    fetchUser().finally(() => setLoading(false));
  }, [fetchUser, navigate]);

  // Connect the realtime socket once we know who the user is.
  const realtime = useRealtime(user?._id);

  if (loading || !user) return <Loader />;

  const isMessages = view === "messages";

  const renderCenter = () => {
    switch (view) {
      case "home":
        return <Feed user={user} fetchUser={fetchUser} />;
      case "explore":
        return <Explore user={user} />;
      case "notifications":
        return <Notifications user={user} realtime={realtime} />;
      case "bookmarks":
        return <Bookmarks user={user} />;
      case "messages":
        return <Messages user={user} fetchUser={fetchUser} setUser={setUser} realtime={realtime} />;
      case "post":
        return <PostDetail user={user} fetchUser={fetchUser} />;
      case "connections":
        return <Connections user={user} fetchUser={fetchUser} />;
      case "profile":
      default:
        return <Profile user={user} fetchUser={fetchUser} setUser={setUser} />;
    }
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.leftPanel}>
        <Menu user={user} fetchUser={fetchUser} realtime={realtime} />
      </div>
      <div className={isMessages ? Styles.mainPanelFull : Styles.mainPanelLarge}>
        {!isMessages && <MobileMenu user={user} fetchUser={fetchUser} />}
        {renderCenter()}
        {isMessages && <MobileMenu user={user} fetchUser={fetchUser} />}
      </div>
      {!isMessages && (
        <div className={Styles.rightPanelSmall}>
          <RightPanel user={user} fetchUser={fetchUser} />
        </div>
      )}
    </div>
  );
}
