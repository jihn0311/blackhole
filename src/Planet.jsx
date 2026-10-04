import React from "react";
import { celestialSprite } from "./celestialSprites.js";
export function Planet({ body, large = false }) {
  return (
    <span
      className={`planet detailed ${body.id} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      <img src={celestialSprite(body).url} alt="" draggable="false" />
    </span>
  );
}
