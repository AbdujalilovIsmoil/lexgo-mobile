// Whether a payment provider is connected to the app. While it is not, the card step (CardGateSheet) takes the card, then says the
// payment system is not connected yet — and the request is NOT sent. Switch to true when the provider is live: the confirm button
// then runs the request (useCardGate's `run`) as it was built to.
export const PAYMENTS_CONNECTED = false;
