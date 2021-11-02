import { InjectedConnector } from '@web3-react/injected-connector';

// For metamask only for now
export const injected = new InjectedConnector({
	supportedChainIds: [3],
});
