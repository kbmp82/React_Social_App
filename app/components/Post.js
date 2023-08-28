import React from "react";
import { Link } from "react-router-dom";

export default function Post({ post, onClick, hideAuthor }) {
  return (
    <Link
      onClick={onClick}
      to={`/post/${post._id}`}
      className="list-group-item list-group-item-action"
    >
      <img className="avatar-tiny" src={post.author.avatar} />{" "}
      <strong>{post.title}</strong>{" "}
      <span className="text-muted small">
        {!hideAuthor && <>by {post.author.username}</>} on{" "}
        {new Date(post.createdDate).toLocaleDateString()}{" "}
      </span>
    </Link>
  );
}
