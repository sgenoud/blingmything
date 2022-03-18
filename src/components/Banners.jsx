import React from "react";
import styled, { keyframes } from "styled-components";

const pulsating = keyframes`
  0%   { opacity: 0.1; }
  100% { opacity: 1; }
`;

export const Banner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  padding: 0.6em;
  background-color: rgba(10, 10, 10, 0.5);
  color: white;
  text-align: center;
`;
const Pulse = styled.span`
  animation: ${pulsating} 1s infinite alternate ease-out;
`;

export const PulsingBanner = (props) => {
  return (
    <Banner>
      <Pulse {...props} />
    </Banner>
  );
};
