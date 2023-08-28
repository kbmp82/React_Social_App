import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import { useParams, Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { useImmerReducer } from "use-immer";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import NotFound from "./NotFound";

export default function EditPost() {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "titleChange":
        draft.title.value = action.value;
        return;
      case "bodyChange":
        draft.body.value = action.value;
        return;
      case "submitRequest":
        if (!draft.title.hasErrors) {
          draft.sendCount++;
        }
        return;
      case "validateFields":
        if (!draft.title.value.trim() || !draft.body.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title and a body";
        } else {
          draft.title.hasErrors = false;
          draft.title.message = "";
        }
        return;
      case "notFound":
        draft.notFound = true;
        draft.isFetching = false;
        return;
      default:
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "validateFields" });
    dispatch({ type: "submitRequest" });
  }

  useEffect(() => {
    const request = Axios.CancelToken.source();
    (async function getPost() {
      try {
        const res = await Axios.get(`/post/${state.id}`, {
          CancelToken: request,
        });
        if (res.data) {
          dispatch({ type: "fetchComplete", value: res.data });
          if (appState.user.username != res.data.author.username) {
            appDispatch({
              type: "flashMessage",
              value: {
                text: "You do not have permissiont to edit this post.",
                alertType: "danger",
              },
            });
            setTimeout(() => {
              useNavigate(`/post/${state.id}`);
            }, 500);
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (error) {
        console.log(error);
      }
    })();

    //cleanup
    return () => {
      request.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const request = Axios.CancelToken.source();
      (async function sendPost() {
        try {
          const res = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              CancelToken: request,
            }
          );
          dispatch({ type: "saveRequestFinished", value: res.data });
          appDispatch({
            type: "flashMessage",
            value: {
              text: "Your post has been updated.",
              alertType: "success",
            },
          });
          setTimeout(() => {
            navigate(`/post/${state.id}`);
          }, 1500);
        } catch (error) {
          console.log(error);
        }
      })();

      //cleanup
      return () => {
        request.cancel();
      };
    }
  }, [state.sendCount]);
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  if (state.notFound) {
    return <NotFound />;
  }
  return (
    <Page title="Edit Post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onBlur={() => dispatch({ type: "validateFields" })}
            onChange={(e) =>
              dispatch({ type: "titleChange", value: e.target.value })
            }
            value={state.title.value}
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            onBlur={() => dispatch({ type: "validateFields" })}
            onChange={(e) =>
              dispatch({ type: "bodyChange", value: e.target.value })
            }
            value={state.body.value}
          />
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Post
        </button>
      </form>
    </Page>
  );
}
