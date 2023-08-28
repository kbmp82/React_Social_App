import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { Tooltip } from "react-tooltip";

function HeaderLoggedIn() {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleLogout() {
    appDispatch({ type: "logout" });
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <button
        onClick={() => appDispatch({ type: "triggerSearch", value: true })}
        type="button"
        className="text-white mr-2 header-search-icon"
        aria-label="search"
        data-tooltip-content="Search"
        data-tooltip-id="search"
      >
        <i className="fas fa-search"></i>
      </button>
      <Tooltip id="search" className="custom-tooltip" place="bottom" />{" "}
      <button
        data-tooltip-content="Chat"
        data-tooltip-id="chat"
        className={
          "mr-2 header-chat-icon" +
          (appState.unreadChatCount ? " text-danger" : " text-white")
        }
        onClick={() =>
          appDispatch({ type: "triggerChat", value: !appState.isChatOpen })
        }
      >
        <i className="fas fa-comment"></i>
        {appState.unreadChatCount > 0 && (
          <span className="chat-count-badge text-white">
            {appState.unreadChatCount > 9 ? "9+" : appState.unreadChatCount}
          </span>
        )}
      </button>
      <Tooltip id="chat" className="custom-tooltip" place="bottom" />{" "}
      <Link
        data-tooltip-content="Profile"
        data-tooltip-id="profile"
        className="mr-2"
        aria-label="profile"
        to={`/profile/${appState.user.username}`}
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <Tooltip id="profile" className="custom-tooltip" place="bottom" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{" "}
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
