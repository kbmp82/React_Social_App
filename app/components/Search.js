import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";

export default function Search() {
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);

    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  function searchKeyPressHandler(e) {
    e.key == "Escape" && appDispatch({ type: "triggerSearch", value: false });
  }

  function handleInput(e) {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  }

  useEffect(() => {
    let delay;
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading";
      });
      delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++;
        });
      }, 1000);
    } else {
      setState((draft) => {
        draft.show = "neither";
      });
    }
    //cleaup function that runs when unounted or prior to executing when useEffect is called more than 1 time.
    return () => clearTimeout(delay);
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const axiosRequest = Axios.CancelToken.source();
      try {
        (async () => {
          const res = await Axios.post(
            "/search",
            { searchTerm: state.searchTerm },
            { CancelToken: axiosRequest }
          );
          if (res.data) {
            setState((draft) => {
              draft.results = res.data;
            });
          }
        })();
      } catch (error) {
        console.log(error);
      }

      setState((draft) => {
        draft.show = "results";
      });
      return () => axiosRequest.cancel();
    }
  }, [state.requestCount]);

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onInput={handleInput}
            autoFocus=""
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <button
            onClick={() => appDispatch({ type: "triggerSearch", value: false })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </button>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              "circle-loader " +
              (state.show == "loading" && "circle-loader--visible")
            }
          ></div>
          <div
            className={
              "live-search-results " +
              (state.show == "results" && "live-search-results--visible")
            }
          >
            <div className="list-group shadow-sm">
              <div className="list-group-item active">
                <strong>Search Results</strong> ({state.results.length}{" "}
                {state.results.length == 1 ? "item" : "items"} found)
              </div>
              {state.results.map((post) => {
                return (
                  <Link
                    key={post._id}
                    to={`/post/${post._id}`}
                    onClick={() =>
                      appDispatch({ type: "triggerSearch", value: false })
                    }
                    className="list-group-item list-group-item-action"
                  >
                    <img className="avatar-tiny" src={post.author.avatar} />{" "}
                    <strong>{post.title}</strong>{" "}
                    <span className="text-muted small">
                      by {post.author.username} on{" "}
                      {new Date(post.createdDate).toLocaleDateString()}{" "}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
