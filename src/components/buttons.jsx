import styled from "styled-components";

export const IconButton = styled.button`
  height: 2.2rem;
  width: 2.2rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  & > * {
    overflow: visible;
  }
`;

export const IconGroup = styled.span`
  & > * {
    border-radius: 0;
  }
  & > :first-child {
    border-radius: var(--border-radius) 0 0 var(--border-radius);
  }
  & > :last-child {
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
  }
`;

export const SecondaryActionButton = styled.button`
  background-color: transparent;
  color: var(--color-link);
`;
