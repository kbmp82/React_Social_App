import React from "react";

export default function FlashMessage({ messages }) {
  return (
    <div className="floating-alerts">
      {messages.map((msg, index) => {
        return (
          <div
            key={index}
            className={
              "alert text-center floating-alert shadow-sm alert-" +
              msg.alertType
            }
          >
            {msg.text}
          </div>
        );
      })}
    </div>
  );
}
