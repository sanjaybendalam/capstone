import React from "react";
import { ProgressBar } from "react-bootstrap";

const GoalProgress = ({ current, target }) => {
  const percentage = Math.min((current / target) * 100, 100);
  return <ProgressBar now={percentage} label={`${percentage.toFixed(0)}%`} />;
};

export default GoalProgress;
