import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import './directMessage.scss';
import axios from 'axios';
import { DM, DMUser } from '../sidebar/sidebarType';
import { ioCommunity } from '../../socket/socket';

type DMProps = {
	myProfile: {id: number, nickname: string},
	DMReceiver: DMUser,
	DMReceiverRef: MutableRefObject<DMUser | null>,
	closeDM: () => void,
	alertNewDM: (senderID: number) => void
};

const DirectMessage = ({myProfile, DMReceiver, DMReceiverRef, closeDM, alertNewDM}: DMProps) => {
	const [message, setMessage] = useState<string>('');
	const [DMList, setDMList] = useState<DM[]>([]);
	const DMRef = useRef<HTMLLIElement | null>(null);

	const fetchDMList = async (friendID: number) => {
		try {
			let newDMList: DM[] = [];
			const response = await axios.get(
				`${process.env.REACT_APP_SERVER_ADDRESS}/dm?friendID=${friendID}`
			);
			response.data.map((dm: any) => newDMList.push({
				id: (dm.isSender) ? dm.userID : dm.friendID,
				message: dm.dm.message
			}));
			setDMList(newDMList);
			DMRef.current?.scrollIntoView();
		} catch (e) {
			console.log(`[DMError] ${e}`);
		}
	};
	useEffect(() => { fetchDMList(DMReceiver.id) }, [DMReceiver]);

	const receiveDM = (newDM: DM) => {
		if (newDM.id === DMReceiverRef?.current?.id || newDM.id === myProfile.id) {
			setDMList(DMList => [...DMList, newDM]);
			DMRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
		else alertNewDM(newDM.id);
	}
	useEffect(() => {
		ioCommunity.on('dmToClient', (newDM: DM) => { receiveDM(newDM) });
	}, []);

	const sendDM = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter' || message === '')
			return;
		const newDM = {
			userID: myProfile.id,
			friendID: DMReceiver.id,
			message: message,
		};
		ioCommunity.emit('dmToServer', newDM);
		setMessage('');
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value);

	return (
		<div className="DM">
			<div className="DM-header">
				<div className="profile small">
					<img className="avatar" src={DMReceiver.avatar} alt="cannot loaded avatar" />
				</div>
				<h3>{DMReceiver.nickname}</h3>
				<button onClick={closeDM}>
					<img src="/icons/dm/close.svg"/>
				</button>
			</div>
			<ul>
				{DMList.map(DM => (
					DM.id === myProfile.id ? (
						<li className="dm-message my-dm" ref={DMRef} key={DM.id}>
							<div className="dm-user">{myProfile.nickname}</div>
							<div className="dm-text">{DM.message}</div>
						</li>
					):(
						<li className="dm-message other-dm" ref={DMRef} key={DM.id}>
							<div className="profile small">
								<img className="avatar" src={DMReceiver.avatar} alt="cannot loaded avatar" />
							</div>
							<div>
								<div className="dm-user">{DMReceiver.nickname}</div>
								<div className="dm-text">{DM.message}</div>
							</div>
						</li>
					)
				))}
			</ul>
			<input
			  placeholder="메시지를 입력해주세요"
			  type="text"
			  onChange={onChange}
			  value={message}
			  onKeyPress={sendDM}
			/>
		</div>
	);
}

export default DirectMessage;