import React, { useContext, useEffect } from "react";
import Page from "./Page";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
      checkCount: 0,
    },
    formReady: false,
    submitCount: 0,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot exceed 30 characters.";
        }
        if (
          draft.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasErrors = true;
          draft.username.message =
            "Username can only contain letters and numbers.";
        }
        break;
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 characters.";
        }

        if (!draft.username.hasErrors) {
          draft.username.checkCount++;
        }
        break;
      case "usernameUnique":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "Username already exists.";
        } else {
          draft.username.hasErrors = false;
          draft.username.isUnique = true;
        }
        break;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        break;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address.";
        }
        if (!draft.email.hasErrors) {
          draft.email.checkCount++;
        }
        break;
      case "emailUnique":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "Email already exists.";
        } else {
          draft.email.hasErrors = false;
          draft.email.isUnique = true;
        }
        break;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters.";
        }
        break;
      case "passwordAfterDelay":
        if (draft.password.value.length < 10) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 10 characters.";
        }
        if (!draft.password.hasErrors) {
          draft.password.checkCount++;
        }
        break;
      case "checkFormReady":
        console.log("checking form");
        if (
          draft.username.value.length &&
          !draft.username.hasErrors &&
          draft.email.value.length &&
          !draft.email.hasErrors &&
          draft.password.value.length &&
          !draft.password.hasErrors
        ) {
          console.log("no errors");
          draft.formReady = true;
        } else {
          console.log(
            "has errors",
            draft.username.value.length,
            draft.username.hasErrors,
            draft.email.value.length,
            draft.email.hasErrors,
            draft.password.value.length,
            draft.password.hasErrors
          );
        }
        break;
      case "submitForm":
        draft.submitCount++;
        break;
      default:
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //check username
  useEffect(() => {
    let delay;
    if (state.username.value) {
      delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800);
    }
    return () => clearTimeout(delay);
  }, [state.username.value]);

  //check email
  useEffect(() => {
    let delay;
    if (state.email.value) {
      delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800);
    }
    return () => clearTimeout(delay);
  }, [state.email.value]);

  //check password
  useEffect(() => {
    let delay;
    if (state.password.value) {
      delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800);
    }
    return () => clearTimeout(delay);
  }, [state.password.value]);

  //check if username is unique
  useEffect(() => {
    if (state.username.checkCount) {
      const axiosRequest = Axios.CancelToken.source();
      try {
        (async () => {
          const res = await Axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { CancelToken: axiosRequest }
          );
          dispatch({ type: "usernameUnique", value: res.data });
        })();
      } catch (error) {
        console.log(error);
      }
      return () => axiosRequest.cancel();
    }
  }, [state.username.checkCount]);

  //check if email is unique
  useEffect(() => {
    if (state.email.checkCount) {
      const axiosRequest = Axios.CancelToken.source();
      try {
        (async () => {
          const res = await Axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { CancelToken: axiosRequest }
          );
          dispatch({ type: "emailUnique", value: res.data });
        })();
      } catch (error) {
        console.log(error);
      }
      return () => axiosRequest.cancel();
    }
  }, [state.email.checkCount]);

  //check form ready
  useEffect(() => {
    dispatch({ type: "checkFormReady" });
  }, [
    state.username.isUnique,
    state.email.isUnique,
    state.password.checkCount,
  ]);

  useEffect(() => {
    Axios.post("/register", {
      username: state.username.value,
      email: state.email.value,
      password: state.password.value,
    })
      .then((res) => {
        console.log("user created successfully", res);
        appDispatch({
          type: "flashMessage",
          value: {
            text: "Congrats! Welcome to your new account.",
            alertType: "success",
          },
        });
        appDispatch({ type: "login", value: res.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }, [state.submitCount]);

  function handleSubmit(e) {
    e.preventDefault();
    if (state.formReady) {
      dispatch({ type: "submitForm" });
    }
  }
  return (
    <Page wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
            posts that are reminiscent of the late 90&rsquo;s email forwards? We
            believe getting back to actually writing is the key to enjoying the
            internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <CSSTransition
                in={state.username.hasErrors}
                timeout={300}
                classNames="liveValidationMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidationMessage">
                  {state.username.message}
                </div>
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "usernameImmediately",
                    value: e.target.value,
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <CSSTransition
                in={state.email.hasErrors}
                timeout={300}
                classNames="liveValidationMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidationMessage">
                  {state.email.message}
                </div>
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "emailImmediately",
                    value: e.target.value,
                  })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <CSSTransition
                in={state.password.hasErrors}
                timeout={300}
                classNames="liveValidationMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidationMessage">
                  {state.password.message}
                </div>
              </CSSTransition>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "passwordImmediately",
                    value: e.target.value,
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />
            </div>

            <button
              disabled={!state.formReady}
              type="submit"
              className="py-3 mt-4 btn btn-lg btn-success btn-block"
            >
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
