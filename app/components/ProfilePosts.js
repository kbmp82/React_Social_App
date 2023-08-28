import Axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Post from "./Post";

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
  }, [username]);

  if (isLoading)
    return (
      <div>
        <LoadingDotsIcon />
      </div>
    );

  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post post={post} hideAuthor={true} key={post._id} />;
      })}
    </div>
  );
}
export default ProfilePosts;
