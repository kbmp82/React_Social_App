import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import { useParams, Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import { Tooltip } from "react-tooltip";
import NotFound from "./NotFound";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

export default function ViewSinglePost() {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState({});
  const [notFound, setNotFound] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  function handleDelete() {
    const confirmDelete = window.confirm("Do you want to delete this post?");
    if (confirmDelete) {
      (async () => {
        try {
          const res = await Axios.delete(`/post/${id}`, {
            data: {
              token: appState.user.token,
            },
          });
          if (res.data) {
            appDispatch({
              type: "flashMessage",
              value: "Post deleted successfully.",
            });
            navigate(`/profile/${appState.user.username}`);
          } else {
            appDispatch({
              type: "flashMessage",
              value: "Post could not be deleted.",
            });
          }
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }

  function isOwner() {
    if (!appState.loggedIn) return false;
    return appState.user.username == post.author.username;
  }

  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function getPost() {
      try {
        const res = await Axios.get(`/post/${id}`, { CancelToken: request });
        if (res.data) {
          setPost(res.data);
        } else {
          setNotFound(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, [id]);

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  if (notFound) {
    return <NotFound />;
  }
  return (
    <Page title={post.title}>
      <div className="container container--narrow py-md-5">
        <div className="d-flex justify-content-between">
          <h2>{post.title}</h2>
          {isOwner() && (
            <span className="pt-2">
              <Link
                to={`/post/${id}/edit`}
                data-tooltip-content="Edit"
                data-tooltip-id="edit"
                className="text-primary mr-2"
              >
                <i className="fas fa-edit"></i>
              </Link>
              <Tooltip id="edit" className="custom-tooltip" />{" "}
              <button
                onClick={handleDelete}
                type="button"
                className="delete-post-button text-danger"
                data-tooltip-content="Delete"
                data-tooltip-id="delete"
              >
                <i className="fas fa-trash"></i>
                <Tooltip id="delete" className="custom-tooltip" />
              </button>
            </span>
          )}
        </div>

        <p className="text-muted small mb-4">
          <Link to={`/profile/${post.author.username}`}>
            {post.author.avatar ? (
              <img className="avatar-tiny" src={post.author.avatar} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
                style={{ maxWidth: "30px" }}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </Link>
          Posted by{" "}
          <Link to={`/profile/${post.author.username}`}>
            {post.author.username}
          </Link>{" "}
          on {new Date(post.createdDate).toDateString()}
        </p>

        <div className="body-content">
          <ReactMarkdown
            children={post.body}
            allowedElements={[
              "p",
              "br",
              "strong",
              "h1",
              "h2",
              "h3",
              "h4",
              "ol",
              "ul",
              "li",
            ]}
          />
        </div>
      </div>
    </Page>
  );
}
