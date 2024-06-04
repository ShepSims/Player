import * as ScreenOrientation from 'expo-screen-orientation';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { child, get, onValue, ref, set, update } from 'firebase/database';
import { db } from './firebaseConfig';
import { useEffect, useRef, useState } from 'react';
import { AddItemModal } from './AddItemModal';
import BackpackModal from './BackpackModal';
import Controller from './Controller';
import { Gesture, GestureDetector, GestureHandlerRootView, State, TapGestureHandler } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ProjectileComponent } from './Projectile';

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

	const [backpack, setBackpack] = useState({});

	const [player1, setPlayer1] = useState({ x: 0, y: 0, rotation: 0 });
	const [gun, setGun] = useState({ x: 0, y: 0, rotation: 0 });
	const [aimVisible, setAimVisible] = useState(true);
	const [sight, setSight] = useState({});

	const [projectile, setProjectile] = useState({
		active: false,
		x: 0,
		y: 0,
		rotation: 0,
	});

	const [projectiles, setProjectiles] = useState([{}]);

	const [attackAnimation, setAttackAnimation] = useState({
		visible: false,
		x: 0,
		y: 0,
		rotation: 0,
	});
	const attackOpacity = useRef(new Animated.Value(0)).current;

	const [enemies, setEnemies] = useState([
		{ id: 1, x: width / 2, y: height / 2, size: 25 },
		{ id: 2, x: width / 2 + 100, y: height / 3, size: 50 },
		{ id: 3, x: width / 2 - 100, y: height / 3, size: 10 },
		// Add more enemies as needed
	]);
	useEffect(() => {
		const interval = setInterval(() => {
			setProjectiles((prevProjectiles) => {
				return prevProjectiles.map((proj) => {
					if (!proj.active) return proj;
					const speed = 5;
					const angleRad = (proj.rotation * Math.PI) / 180;
					const nextX = proj.x + Math.cos(angleRad) * speed;
					const nextY = proj.y + Math.sin(angleRad) * speed;

					const hitEnemy = enemies.find((enemy) => {
						const distance = Math.sqrt((nextX - enemy.x - enemy.size / 2) ** 2 + (nextY - enemy.y - enemy.size / 2) ** 2);
						return distance < enemy.size / 2;
					});

					if (hitEnemy) {
						console.log(`Hit enemy ${hitEnemy.id}`);
						setEnemies((enemies) => enemies.filter((enemy) => enemy.id !== hitEnemy.id));
						return { ...proj, active: false };
					}

					return { ...proj, x: nextX, y: nextY };
				});
			});
		}, 16); // ~60fps

		return () => clearInterval(interval);
	}, [enemies]);

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

	const onEndRightController = (newState) => {
		setAimVisible(true);
		setProjectiles((oldState) => {
			return [
				...oldState,
				{
					active: true,
					x: player1.x, // Assuming you have player1's position
					y: player1.y,
					rotation: newState.rotation,
				},
			];
		});
	};

	const onStartRightController = (newState) => {
		setAimVisible(true);
	};
	const handleLeftController = (newState) => {
		setPlayer1((oldState) => {
			// Calculate new X and Y ensuring they are within bounds
			const newX = Math.min(Math.max(oldState.x + newState.x, 0), width - 100);
			const newY = Math.min(Math.max(oldState.y + newState.y, 0), height - 100);

			return {
				...oldState,
				x: newX,
				y: newY,
				rotation: newState.rotation,
			};
		});
	};

	const handleRightController = (newState) => {
		setGun((oldState) => {
			return {
				...oldState,
				rotation: newState.rotation,
			};
		});

		if (aimVisible) {
			setSight({
				rotation: newState.rotation,
			});
		}
	};

	const requestRef = useRef(null);

	useEffect(() => {
		if (projectile.active) {
			const animateProjectile = () => {
				setProjectile((prev) => {
					const speed = 1;
					const angleRad = (prev.rotation * Math.PI) / 180;
					return {
						...prev,
						x: prev.x + Math.cos(angleRad) * speed,
						y: prev.y + Math.sin(angleRad) * speed,
					};
				});
				requestRef.current = requestAnimationFrame(animateProjectile);
			};
			requestRef.current = requestAnimationFrame(animateProjectile);
			return () => cancelAnimationFrame(requestRef.current);
		}
	}, [projectile.active]);
	const handleMeleeAttack = () => {
		const attackDistance = 50;
		const attackWidth = 50;
		const playerDirectionRad = (player1.rotation * Math.PI) / 180;

		const startX = player1.x;
		const startY = player1.y;

		const centerX = startX + (Math.cos(playerDirectionRad) * attackDistance) / 2;
		const centerY = startY + (Math.sin(playerDirectionRad) * attackDistance) / 2;

		setAttackAnimation({
			visible: true,
			x: centerX - attackWidth / 2,
			y: centerY - attackDistance / 2,
			rotation: player1.rotation,
		});

		Animated.sequence([
			Animated.timing(attackOpacity, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(attackOpacity, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start(() => {
			setAttackAnimation((prev) => ({ ...prev, visible: false }));
		});

		const hitEnemies = enemies.filter((enemy) => {
			const enemyCenterX = enemy.x + enemy.size / 2;
			const enemyCenterY = enemy.y + enemy.size / 2;

			const withinX = enemyCenterX >= startX && enemyCenterX <= centerX;
			const withinY = enemyCenterY >= startY && enemyCenterY <= centerY;

			return withinX && withinY;
		});

		if (hitEnemies.length > 0) {
			console.log(`Hit ${hitEnemies.length} enemies with melee!`);
			setEnemies((enemies) => enemies.filter((enemy) => !hitEnemies.includes(enemy)));
		}
	};

	const handleFireAttack = () => {
		const attackDistance = 50;
		const attackWidth = 50;
		const playerDirectionRad = (player1.rotation * Math.PI) / 180;

		const startX = player1.x;
		const startY = player1.y;

		const centerX = startX + (Math.cos(playerDirectionRad) * attackDistance) / 2;
		const centerY = startY + (Math.sin(playerDirectionRad) * attackDistance) / 2;

		setAttackAnimation({
			visible: true,
			x: centerX - attackWidth / 2,
			y: centerY - attackDistance / 2,
			rotation: player1.rotation,
		});

		Animated.sequence([
			Animated.timing(attackOpacity, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}),
			Animated.timing(attackOpacity, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}),
		]).start(() => {
			setAttackAnimation((prev) => ({ ...prev, visible: false }));
		});

		const hitEnemies = enemies.filter((enemy) => {
			const enemyCenterX = enemy.x + enemy.size / 2;
			const enemyCenterY = enemy.y + enemy.size / 2;

			const withinX = enemyCenterX >= startX && enemyCenterX <= centerX;
			const withinY = enemyCenterY >= startY && enemyCenterY <= centerY;

			return withinX && withinY;
		});

		if (hitEnemies.length > 0) {
			console.log(`Hit ${hitEnemies.length} enemies with melee!`);
			setEnemies((enemies) => enemies.filter((enemy) => !hitEnemies.includes(enemy)));
		}
	};

	const [isFireAttackActive, setIsFireAttackActive] = useState(false);

	useEffect(() => {
		let interval;
		if (isFireAttackActive) {
			interval = setInterval(handleFireAttack, 100);
		} else {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [isFireAttackActive]);

	return (
		<GestureHandlerRootView>
			<View style={styles.container}>
				{/* Backpack Button */}
				{/* <PlayerController /> */}
				<Controller
					right={true}
					onStateChange={handleRightController}
					onEnd={onEndRightController}
					onStart={onStartRightController}
				></Controller>
				<Controller onStateChange={handleLeftController}></Controller>
				{enemies.map((enemy) => (
					<View
						key={enemy.id}
						style={{
							position: 'absolute',
							left: enemy.x,
							top: enemy.y,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<View
							style={{
								width: enemy.size,
								height: enemy.size,
								backgroundColor: 'blue', // Example color
								borderRadius: enemy.size / 2,
							}}
						></View>
					</View>
				))}

				{/* <TouchableOpacity
					style={{ position: 'absolute', top: 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}
					onPress={() => setBackpackModalVisible(true)}
				>
					<Text style={{ color: 'white' }}>Backpack</Text>
				</TouchableOpacity> */}

				<TapGestureHandler
					onHandlerStateChange={({ nativeEvent }) => {
						if (nativeEvent.state === State.END) {
							setBackpackModalVisible(!backpackModalVisible);
						}
					}}
				>
					<View style={{ position: 'absolute', top: 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}>
						<Text style={styles.buttonText}>Backpack</Text>
					</View>
				</TapGestureHandler>
				<TapGestureHandler
					onHandlerStateChange={({ nativeEvent }) => {
						console.log('FIRE');
						if (nativeEvent.state === State.END) {
							console.log('playerX, ', player1.x);
							setProjectile({
								active: true,
								x: player1.x, // Assuming you have player1's position
								y: player1.y,
								rotation: player1.rotation,
							});
						}
					}}
				>
					<View style={{ position: 'absolute', top: height / 2, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}>
						<Text style={styles.buttonText}>Fire!</Text>
					</View>
				</TapGestureHandler>

				<TapGestureHandler
					onHandlerStateChange={({ nativeEvent }) => {
						if (nativeEvent.state === State.END) {
							handleMeleeAttack();
						}
					}}
				>
					<View style={{ position: 'absolute', top: height / 2 + 50, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}>
						<Text style={styles.buttonText}>Melee!</Text>
					</View>
				</TapGestureHandler>

				<TapGestureHandler
					onHandlerStateChange={({ nativeEvent }) => {
						if (nativeEvent.state === State.BEGAN) {
							console.log('begin');
							setIsFireAttackActive(true);
						} else if (nativeEvent.state === State.END) {
							console.log('end');
							setIsFireAttackActive(false);
						}
					}}
				>
					<View style={{ position: 'absolute', top: height / 2 + 100, right: 0, margin: 10, padding: 10, backgroundColor: '#2196F3' }}>
						<Text style={styles.buttonText}>Flame!</Text>
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
					style={[styles.circle, { left: player1.x - 50, top: player1.y - 50, transform: [{ rotate: `${player1.rotation}deg` }] }]}
					source={require('./assets/ship.png')}
				></Animated.Image>
				<Animated.Image
					style={[
						styles.circle,
						{
							left: player1.x - 25,
							top: player1.y - 25,
							transform: [{ rotate: `${gun.rotation}deg` }],
							width: 50,
							height: 50,
						},
					]}
					source={require('./assets/disc.png')}
				></Animated.Image>

				{/* Aim / Sight */}
				<View
					style={[
						{
							left: player1.x,
							top: player1.y - 50,
							transform: [{ rotate: `${gun.rotation + 90}deg` }, { translateY: -50 }],
							width: 1,
							height: 100,
							backgroundColor: 'gray',
							position: 'absolute',
						},
					]}
				></View>
				{attackAnimation.visible ? (
					<Animated.View
						style={{
							position: 'absolute',
							left: attackAnimation.x,
							top: attackAnimation.y,
							width: 100, // or any appropriate size
							height: 50, // or any appropriate size
							backgroundColor: 'black', // Choose an appropriate color
							// opacity: attackOpacity,
							transform: [
								// { translateX: -10 }, // Adjust based on size for centering
								// { translateY: -2.5 }, // Adjust based on size for centering
								{ rotate: `${attackAnimation.rotation}deg` },
							],
						}}
					/>
				) : null}
				<ProjectileComponent projectile={projectile} />

				{projectiles.map((projectile) => projectile.active && <ProjectileComponent key={projectile.id} projectile={projectile} />)}
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
		position: 'absolute',
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
