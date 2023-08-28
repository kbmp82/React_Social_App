import Axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";

function ProfileFollow({ type }) {
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const { username } = useParams();
  const appState = useContext(StateContext);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function fetchPosts() {
      try {
        setIsLoading(true);
        const res = await Axios.get(`/profile/${username}/${type}`, {
          CancelToken: request,
        });
        setIsLoading(false);
        setFollowers(res.data);
      } catch (error) {
        console.log(error);
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, [type]);

  if (isLoading)
    return (
      <div>
        <LoadingDotsIcon />
      </div>
    );

  return (
    <div className="list-group">
      {(() => {
        if (followers.length > 0) {
          return followers.map((follower, index) => {
            return (
              <Link
                to={`/profile/${follower.username}`}
                key={index}
                className="list-group-item list-group-item-action"
              >
                <img className="avatar-tiny" src={follower.avatar} />{" "}
                <strong>{follower.username}</strong>{" "}
              </Link>
            );
          });
        } else {
          return (() => {
            if (type == "followers") {
              return appState.user.username == username
                ? "You are not following anyone yet."
                : "This user is not following anyone yet.";
            } else {
              return appState.user.username == username
                ? "You do not have any followers yet."
                : "This user does not have any followers yet.";
            }
          })();
        }
      })()}
    </div>
  );
}
export default ProfileFollow;
