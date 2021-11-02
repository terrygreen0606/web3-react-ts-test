import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import WeenusContract from './WeenusTokenABI.json';

let selectedAccount;
let contract;
let initialized = false;

export const init = async () => {
	let provider = (window as any).ethereum;
	if (typeof provider !== 'undefined') {
		try {
			const accounts = await provider.request({
				method: 'eth_requestAccounts',
			});
			selectedAccount = accounts[0];

			provider.on('accountsChanged', (accounts: any) => {
				selectedAccount = accounts[0];
			});
		} catch (error) {
			console.log(error);
			return;
		}
	}

	const web3 = new Web3(provider);
	contract = new web3.eth.Contract(
		WeenusContract as AbiItem[],
		'0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA'
	);

	initialized = true;
	console.log(contract);
};
