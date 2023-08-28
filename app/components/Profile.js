import React, { useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, NavLink, Routes, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import ProfileFollow from "./ProfileFollow";
import { useImmer } from "use-immer";

function Profile() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followingCount: "", followerCount: "" },
    },
  });
  console.log(state);
  const { username } = useParams();

  //get profile data
  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function fetchData() {
      try {
        const res = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          { CancelToken: request }
        );
        setState((draft) => {
          draft.profileData = res.data;
        });
      } catch {
        console.log("there was a problem");
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, [state.profileData]);

  //start following
  useEffect(() => {
    if (!state.startFollowingRequestCount) return;
    setState((draft) => {
      draft.followActionLoading == true;
    });
    const request = Axios.CancelToken.source();
    (async function fetchData() {
      try {
        const res = await Axios.post(
          `/addFollow/${username}/`,
          {
            token: appState.user.token,
          },
          { CancelToken: request }
        );
        setState((draft) => {
          draft.followActionLoading == false;
        });
      } catch {
        console.log("there was a problem");
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, [state.startFollowingRequestCount]);

  //stop following
  useEffect(() => {
    if (!state.stopFollowingRequestCount) return;
    const request = Axios.CancelToken.source();
    (async function fetchData() {
      try {
        const res = await Axios.post(
          `/removeFollow/${username}/`,
          {
            token: appState.user.token,
          },
          { CancelToken: request }
        );
      } catch {
        console.log("there was a problem");
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, [state.stopFollowingRequestCount]);

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
      draft.stopFollowingRequestCount = 0;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
      draft.startFollowingRequestCount = 0;
    });
  }

  return (
    <Page title="Profile Page">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={startFollowing}
              disbaled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={stopFollowing}
              disbaled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Unfollow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Routes>
        <Route path="" element={<ProfilePosts />} />
        <Route path="followers" element={<ProfileFollow type="followers" />} />
        <Route path="following" element={<ProfileFollow type="following" />} />
      </Routes>
    </Page>
  );
}

export default Profile;
