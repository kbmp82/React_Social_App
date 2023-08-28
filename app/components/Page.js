import React, { useEffect } from "react";
import Container from "./Container";

//Page wrapper

function Page(props) {
  useEffect(() => {
    document.title = `${
      props.title ? props.title + " | " : ""
    } React Social App`;
    window.scrollTo(0, 0);
  }, [props.title]);

  return <Container wide={props.wide}>{props.children}</Container>;
}

export default Page;
