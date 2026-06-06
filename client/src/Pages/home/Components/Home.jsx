import React, { useState } from "react";

import Styles from "../../../css/Home/Components/Home.module.css";
import { Tabs } from "../../../ui";
import Composer from "./Composer";
import Posts from "./Posts";

/**
 * Home feed: sticky For You / Following tabs, an inline composer, and the post
 * list. The composer and any post action refresh the feed.
 */
export default function Feed({ user }) {
  const [tab, setTab] = useState("forYou");
  const [reload, setReload] = useState(0);
  const refresh = () => setReload((n) => n + 1);

  return (
    <div className={Styles.container}>
      <div className={Styles.header}>
        <Tabs
          tabs={[
            { key: "forYou", label: "For you" },
            { key: "following", label: "Following" },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      <div className={Styles.composerWrap}>
        <Composer user={user} onPosted={refresh} />
      </div>

      <Posts filter={tab === "following" ? "following" : undefined} reload={reload} currentUser={user} />
    </div>
  );
}
