import * as ScreenOrientation from 'expo-screen-orientation';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { child, get, onValue, ref, set, update } from 'firebase/database';
import { db } from './firebaseConfig';
import { useEffect, useRef, useState } from 'react';
import { AddItemModal } from './AddItemModal';
import BackpackModal from './BackpackModal';
import PlayerController from './PlayerController';
import DualTouchAreas from './DualTouchAreas';
import Controller from './Controller';
import { Gesture, GestureDetector, GestureHandlerRootView, State, TapGestureHandler } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const dbRef = ref(db);

const { width, height } = Dimensions.get('window');

export default function App() {
	useEffect(() => {
		async function changeScreenOrientation() {
			await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
		}

		changeScreenOrientation();
	}, []);
	const [modalVisible, setModalVisible] = useState(false);
	const [backpackModalVisible, setBackpackModalVisible] = useState(false);

	const translateX = useSharedValue(0);
	const translateY = useSharedValue(0);
	const inputRef = useRef(null);
	const [backpack, setBackpack] = useState({});

	const [circleStyle, setCircleStyle] = useState({ x: 0, y: 0, rotation: 0 });

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

	// Function to update the position of the circle

	const handleControllerStateChange = (newState) => {
		// console.log('Controller state changed:', newState, translateX.value);
		setCircleStyle((oldState) => {
			return { x: oldState.x + newState.x, y: oldState.y + newState.y, rotation: newState.rotation };
		});
		// translateY.value = newState.y;
	};

	return (
		<GestureHandlerRootView>
			<View style={styles.container}>
				{/* Backpack Button */}
				{/* <PlayerController /> */}
				<Controller right={true}></Controller>
				<Controller onStateChange={handleControllerStateChange}></Controller>

				{/* <TouchableOpacity
					style={{ position: 'absolute', top: 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}
					onPress={() => setBackpackModalVisible(true)}
				>
					<Text style={{ color: 'white' }}>Backpack</Text>
				</TouchableOpacity> */}

				<TapGestureHandler
					onHandlerStateChange={({ nativeEvent }) => {
						if (nativeEvent.state === State.END) {
							setBackpackModalVisible(true);
						}
					}}
				>
					<View style={{ position: 'absolute', top: 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}>
						<Text style={styles.buttonText}>Backpack</Text>
					</View>
				</TapGestureHandler>

				{/* <View style={{ position: 'absolute', top: 100, alignSelf: 'center', textAlign: 'center', alignItems: 'center' }}>
					<TouchableOpacity onPress={() => setModalVisible(true)} style={{ paddingVertical: 20 }}>
						<Text>Add to Backpack</Text>
					</TouchableOpacity>
				</View> */}

				{/* <TouchableOpacity
					style={{ position: 'absolute', top: 50 }}
					onPress={() => {
						set(ref(db, 'users/'), 'GekkoSpiderBoy');
					}}
				>
					<Text>Reset</Text>
				</TouchableOpacity> */}

				{/* <TouchableOpacity
					style={{ position: 'absolute', top: 100, left: 25 }}
					onPress={() => {
						const updateRef = ref(db);
						const updateObj = { 'users/GekkoSpiderBoy/backpack': { sword: { weight: 1, attack: 1 } } };
						update(updateRef, updateObj);
					}}
				>
					<Text>Menu</Text>
				</TouchableOpacity> */}

				<AddItemModal visible={modalVisible} setVisible={setModalVisible} add={addToBackpack} />
				{/* Backpack Modal */}
				<BackpackModal visible={backpackModalVisible} setVisible={setBackpackModalVisible} backpackItems={backpack} />
				<Animated.Image
					style={[styles.circle, { left: circleStyle.x, top: circleStyle.y, transform: [{ rotate: `${circleStyle.rotation}deg` }] }]}
					source={require('./assets/ship.png')}
				></Animated.Image>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0', // Light background color for better visibility,
		width: width,
		height: height,
	},
	circle: {
		width: 100,
		height: 100,
		resizeMode: 'contain',
		// backgroundColor: 'black',
		// position: 'absolute',
		borderWidth: 1,
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
