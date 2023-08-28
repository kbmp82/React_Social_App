import React, { useContext, useEffect } from "react";
import StateContext from "../StateContext";
import Page from "./Page";
import { useImmer } from "use-immer";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import Post from "./Post";

function Home() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  });

  //get follower posts
  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function fetchData() {
      try {
        const res = await Axios.post(
          "getHomeFeed",
          {
            token: appState.user.token,
          },
          { CancelToken: request }
        );
        setState((draft) => {
          (draft.isLoading = false), (draft.feed = res.data);
        });
      } catch {
        console.log("there was a problem");
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, []);

  if (state.isLoading)
    return (
      <div>
        <LoadingDotsIcon />
      </div>
    );

  return (
    <Page title="Your Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">The Latest From Those You Follow</h2>
          <div className="list-group">
            {state.feed.map((post) => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <div className="container container--narrow py-md-5">
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don’t have any friends to follow that’s okay; you can use the
            “Search” feature in the top menu bar to find content written by
            people with similar interests and then follow them.
          </p>
        </div>
      )}
    </Page>
  );
}

export default Home;
