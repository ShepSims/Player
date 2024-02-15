import { Animated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { child, get, onValue, ref, set, update } from 'firebase/database';
import { db } from './firebaseConfig';
import { useEffect, useRef, useState } from 'react';
import { AddItemModal } from './AddItemModal';
import BackpackModal from './BackpackModal';
import PlayerController from './PlayerController';

const dbRef = ref(db);

export default function App() {
	const [modalVisible, setModalVisible] = useState(false);
	const [backpackModalVisible, setBackpackModalVisible] = useState(false);

	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [text, setText] = useState(null);
	const inputRef = useRef(null);
	const [backpack, setBackpack] = useState({});

	const addToBackpack = (item) => {
		console.log('item: ', item);
		if (item.name) {
			const newItemRef = ref(db, `users/GekkoSpiderBoy/backpack/${item.name}`);
			set(newItemRef, {
				name: item.name,
				quantity: item.quantity,
				attack: item.attack,
				reusable: item.reusable,
			});
			setModalVisible(false); // Close the modal
		}
	};

	// Set up a listener for the backpack contents
	useEffect(() => {
		const backpackRef = ref(db, 'users/GekkoSpiderBoy/backpack');
		const unsubscribe = onValue(backpackRef, (snapshot) => {
			const data = snapshot.val();
			console.log('data: ', data);
			if (data) {
				setBackpack(data); // Update state with new backpack contents
			} else {
				setBackpack({}); // Clear backpack if no data
			}
		});

		// Cleanup subscription on component unmount
		return () => unsubscribe();
	}, []);

	return (
		<View style={styles.container}>
			{/* Backpack Button */}
			<PlayerController />
			<TouchableOpacity
				style={{ position: 'absolute', top: 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}
				onPress={() => setBackpackModalVisible(true)}
			>
				<Text style={{ color: 'white' }}>Backpack</Text>
			</TouchableOpacity>
			<View style={{ position: 'absolute', top: 100, alignSelf: 'center', textAlign: 'center', alignItems: 'center' }}>
				<TouchableOpacity onPress={() => setModalVisible(true)} style={{ paddingVertical: 20 }}>
					<Text>Add to Backpack</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				onPress={() => {
					set(ref(db, 'users/'), 'GekkoSpiderBoy');
				}}
			>
				<Text>Reset</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={{ margin: 50 }}
				onPress={async () => {
					get(child(dbRef, `users/username`))
						.then((snapshot) => {
							if (snapshot.exists()) {
								let user = snapshot.val();
								console.log(user);
							} else {
								console.log('No data available');
							}
						})
						.catch((error) => {
							console.error(error);
						});
				}}
			>
				<Text>Get User</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={{ margin: 50 }}
				onPress={async () => {
					get(child(dbRef, `users/username`))
						.then((snapshot) => {
							if (snapshot.exists()) {
								let user = snapshot.val();
								console.log(user);
							} else {
								console.log('No data available');
							}
						})
						.catch((error) => {
							console.error(error);
						});
				}}
			>
				<Text>Get User</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={{ position: 'absolute', top: 100, left: 25 }}
				onPress={() => {
					const updateRef = ref(db);
					const updateObj = { 'users/GekkoSpiderBoy/backpack': { sword: { weight: 1, attack: 1 } } };
					update(updateRef, updateObj);
				}}
			>
				<Text>Menu</Text>
			</TouchableOpacity>

			<AddItemModal visible={modalVisible} setVisible={setModalVisible} add={addToBackpack} />
			{/* Backpack Modal */}
			<BackpackModal visible={backpackModalVisible} setVisible={setBackpackModalVisible} backpackItems={backpack} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0', // Light background color for better visibility
	},
	dot: {
		width: 20,
		height: 20,
		backgroundColor: 'red',
		position: 'absolute',
	},
	debugText: {
		position: 'absolute',
		top: 50,
		left: 10,
		color: 'black',
	},
});
