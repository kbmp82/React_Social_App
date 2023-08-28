import Axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfilePosts() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function fetchPosts() {
      try {
        const res = await Axios.get(`/profile/${username}/posts`, {
          CancelToken: request,
        });
        setIsLoading(false);
        setPosts(res.data);
      } catch (error) {
        console.log(error);
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, []);

  if (isLoading)
    return (
      <div>
        <LoadingDotsIcon />
      </div>
    );

  return (
    <div className="list-group">
      {posts.map((post) => {
        const date = new Date(post.createdDate).toDateString();
        return (
          <Link
            to={`/post/${post._id}`}
            key={post._id}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={post.author.avatar} />{" "}
            <strong>{post.title}</strong>{" "}
            <span className="text-muted small">on {date}</span>
          </Link>
        );
      })}
    </div>
  );
}
export default ProfilePosts;
