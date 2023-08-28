import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="NotFound">
      <div className="text-center">
        <h2>Oops! We cannot find that page.</h2>
        <Link to="/" className="mt-5">
          Go to home page
        </Link>
      </div>
    </Page>
  );
}

export default NotFound;
