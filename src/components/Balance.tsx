import type { ReactElement, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { AbiItem } from 'web3-utils';
import { Transaction } from 'ethereumjs-tx';
import { injected } from '../connectors';
import WeenusContract from '../WeenusTokenABI.json';

export const Balance = (): ReactElement => {
	const [balance, setBalance] = useState<string>('');
	const [weenusBalance, setWeenusBalance] = useState<string>('');
	const [amount, setAmount] = useState('');
	const [weenusContract, setWeenusContract] = useState<any>(null);
	const [error, setError] = useState<any>({});
	const [hash, setHash] = useState('');

	const { active, account, activate, library, deactivate } = useWeb3React();

	async function connect() {
		try {
			await activate(injected);
		} catch (error) {
			console.log(error);
		}
	}

	async function disconnect() {
		try {
			deactivate();
		} catch (error) {
			console.log(error);
		}
	}

	const send = async (e: FormEvent) => {
		e.preventDefault();
		console.log(amount);

		if (parseFloat(amount) > parseFloat(balance)) {
			return alert('You have insufficient balance');
		}

		if (weenusContract) {
			const count = await library.eth.getTransactionCount(account);
			const rawTransaction = {
				from: account,
				nonce: '0x' + count.toString(16),
				gasPrice: library.utils.toHex(2 * 1e9),
				gasLimit: library.utils.toHex(210000),
				to: '0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA',
				value: '0x0',
				data: weenusContract.methods
					.transfer(
						'0x0000000000000000000000000000000000000000',
						library.utils.toBN(amount)
					)
					.encodeABI(),
				chainId: 3,
			};
			const transaction = new Transaction(rawTransaction, { chain: 3 });
			const privateKey = Buffer.from(
				'c429601ee7a6167356f15baa70fd8fe17b0325dab7047a658a31039e5384bffd',
				'hex'
			);
			transaction.sign(privateKey);

			library.eth.sendSignedTransaction(
				'0x' + transaction.serialize().toString('hex'),
				(err: any, hash: any) => {
					setError(err);
					setHash(hash);
				}
			);

			const weenusBalance = await weenusContract.methods
				.balanceOf(account)
				.call();
			setWeenusBalance(library.utils.fromWei(weenusBalance));
		}
	};

	const connectBtn = <button onClick={connect}>Connect</button>;
	const disconnectBtn = <button onClick={disconnect}>Disconnect</button>;

	useEffect(() => {
		const getBalance = async () => {
			if (active) {
				const balance = await library.eth.getBalance(account);
				setBalance(library.utils.fromWei(balance));

				const weenusContract = new library.eth.Contract(
					WeenusContract as AbiItem[],
					'0x101848D5C5bBca18E6b4431eEdF6B95E9ADF82FA'
				);
				setWeenusContract(weenusContract);

				const weenusBalance = await weenusContract.methods
					.balanceOf(account)
					.call();
				setWeenusBalance(library.utils.fromWei(weenusBalance));
			}
		};

		getBalance();
	}, [active, library, account]);

	const show = (
		<div className="main-grid">
			{active ? (
				<>
					<p>{disconnectBtn}</p>
					<p>Your rETH balance is {balance}</p>
					<p>Your weenus balance is {weenusBalance}</p>
					<form noValidate onSubmit={send}>
						<h5>Send Form</h5>
						<input
							type="text"
							placeholder="Amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<input
							type="text"
							placeholder="Receiver Address"
							value="0x0000000000000000000000000000000000000000"
							disabled
						/>
						<button type="submit">Send</button>
					</form>
					{error && <p>{error.message}</p>}
					{hash && <p>{hash}</p>}
				</>
			) : (
				connectBtn
			)}
		</div>
	);

	return show;
};
