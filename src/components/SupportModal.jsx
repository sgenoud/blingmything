import React from "react";
import styled from "styled-components";

import { Dialog, DialogTitle, DialogBody, DialogButtons } from "./Dialog.jsx";

const BoxCard = styled.a`
  display: flex;
  flex: 1 1 auto;
  margin: 0;

  background: none;
  border: none;
  font: inherit;
  outline: inherit;
  cursor: pointer;

  padding: 0.6em;
  border: 1px var(--color, lightblue) solid;
  border-radius: var(--border-radius, 3px);
  text-decoration: none;
  color: var(--color-text);

  &: hover {
    text-decoration: none;
    filter: brightness(var(--active-brightness, 0.85));
  }
`;

const PayPalForm = styled.form`
  display: flex;
`;

const Body = styled(DialogBody)`
  & > :not(:first-child) {
    margin-top: calc(var(--vertical-spacing, 1em) / 2);
  }
`;

export default function SupportModal({ onClose }) {
  return (
    <Dialog onClose={onClose}>
      <DialogTitle onClose={onClose}>Support my work</DialogTitle>
      <Body>
        <div>
          Thanks for helping me maintain Bling my Thing. You can support my work
          with these services.
        </div>

        <PayPalForm
          action="https://www.paypal.com/donate"
          method="post"
          target="_blank"
        >
          <input type="hidden" name="hosted_button_id" value="R2SMA73SPDBMC" />
          <BoxCard
            as="button"
            src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
            name="submit"
            title="Support my work"
            alt="Donate with PayPal button"
          >
            Single transfer with PayPay
          </BoxCard>
        </PayPalForm>

        <BoxCard
          as="a"
          href="https://github.com/sponsors/sgenoud"
          target="_blank"
        >
          Github sponsorship
        </BoxCard>
        <BoxCard as="a" href="https://ko-fi.com/stevegenoud" target="_blank">
          Ko-fi
        </BoxCard>
        <BoxCard
          as="a"
          href="https://www.patreon.com/stevegenoud"
          target="_blank"
        >
          Patreon
        </BoxCard>
      </Body>
      <DialogButtons>
        <button onClick={onClose}>Close</button>
      </DialogButtons>
    </Dialog>
  );
}
