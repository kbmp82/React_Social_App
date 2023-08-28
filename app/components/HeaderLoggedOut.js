import Axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import DispatchContext from "../DispatchContext";

function HeaderLoggedOut() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const appDispatch = useContext(DispatchContext);

  function handleSubmit(e) {
    e.preventDefault();
    e.target.reset();

    Axios.post("/login", {
      username,
      password,
    })
      .then((res) => {
        if (res.data) {
          appDispatch({ type: "login", value: res.data });
          appDispatch({
            type: "flashMessage",
            value: {
              text: "You have successfully logged in.",
              alertType: "success",
            },
          });
        } else {
          appDispatch({
            type: "flashMessage",
            value: {
              text: "Username or password incorrect.",
              alertType: "danger",
            },
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={(e) => setUsername(e.target.value)}
            name="username"
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
            aria-label="username"
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
            aria-label="password"
          />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
