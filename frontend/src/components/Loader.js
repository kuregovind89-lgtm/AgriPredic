import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="loader-spinner" />
      <p>{text}</p>
    </div>
  );
}
