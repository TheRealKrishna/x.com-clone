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
import ComposeModal from "./Components/ComposeModal";
import ComingSoon from "./Components/ComingSoon";
import { Spinner } from "../../ui";
import { authApi } from "../../api";
import { isLoggedIn, clearToken } from "../../api/config";
import { useRealtime } from "../../hooks/useRealtime";

const PLACEHOLDER_VIEWS = ["lists", "communities", "premium", "more"];

/**
 * Authenticated app shell. The `view` prop (set per-route in App.jsx) decides
 * which panel renders in the center column.
 */
export default function Index({ view }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [feedReload, setFeedReload] = useState(0);

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

  const realtime = useRealtime(user?._id);

  if (loading || !user) return <Spinner />;

  const isMessages = view === "messages";
  const openCompose = () => setComposeOpen(true);

  const renderCenter = () => {
    if (PLACEHOLDER_VIEWS.includes(view)) return <ComingSoon which={view} />;
    switch (view) {
      case "home":
        return <Feed user={user} fetchUser={fetchUser} reloadSignal={feedReload} onCompose={openCompose} />;
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
        <Menu user={user} fetchUser={fetchUser} realtime={realtime} onCompose={openCompose} />
      </div>
      <div className={isMessages ? Styles.mainPanelFull : Styles.mainPanelLarge}>{renderCenter()}</div>
      {!isMessages && (
        <div className={Styles.rightPanelSmall}>
          <RightPanel user={user} fetchUser={fetchUser} />
        </div>
      )}

      {!isMessages && <MobileMenu user={user} onCompose={openCompose} />}
      {isMessages && !window.location.pathname.match(/\/messages\/.+/) && <MobileMenu user={user} onCompose={openCompose} />}

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        user={user}
        onPosted={() => setFeedReload((n) => n + 1)}
      />
    </div>
  );
}
