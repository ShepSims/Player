import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

// Retrieve the screen's width for potential future use (e.g., responsive design).
const { width, height } = Dimensions.get('window');

/**
 * A draggable joystick component
 *
 * Initializes the joystick wherever users puts their finger
 * allows dragging within a specified maximum distance,
 */
export default function Controller({ right, onStateChange }) {
	// Define the maximum distance the joystick can move from its center.
	const maxDistance = 75;

	// Shared values to track the center position of the joystick controller.
	const controllerCenterX = useSharedValue(right ? -100 : 100);
	const controllerCenterY = useSharedValue(85);

	// Shared values to track the joystick's current position relative to the center.
	const joystickPositionX = useSharedValue(0);
	const joystickPositionY = useSharedValue(0);

	const startX = useSharedValue(100);
	const startY = useSharedValue(100);

	const start0 = useSharedValue(false);
	const opacity = useSharedValue(1); // Start fully visible

	const [intervalId, setIntervalId] = useState(null);

	const updatePosition = (x, y) => {
		const angleRadians = Math.atan2(y, x); // Calculate based on current x, y
		const angleDegrees = angleRadians * (180 / Math.PI); // Convert to degrees

		// Normalize the values to [-1, 1] based on maxDistance for x and y
		const normalizedX = x / 10;
		const normalizedY = y / 10;

		onStateChange({
			x: normalizedX,
			y: normalizedY,
			rotation: angleDegrees,
		});
	};

	// Call this function on gesture start or update
	const startContinuousUpdate = (x, y) => {
		if (intervalId) clearInterval(intervalId); // Clear existing interval if any

		console.log('intervalId', intervalId);
		const id = setInterval(() => {
			updatePosition(x, y);
		}, 1); // Adjust interval duration as needed

		setIntervalId(id);
	};

	// Clear the interval on gesture end
	const stopContinuousUpdate = () => {
		console.log('here');
		if (intervalId) clearInterval(intervalId);
		setIntervalId(null);
	};

	// Animated styles for the joystick base and the joystick itself.
	const joystickBaseStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: controllerCenterX.value }, { translateY: controllerCenterY.value }],
		opacity: opacity.value, // Apply animated opacity here
	}));

	const joystickStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: joystickPositionX.value + 50 }, { translateY: joystickPositionY.value + 50 }],
	}));

	/**
	 * Handles the joystick's pan gesture.
	 * - onStart: Initializes the controller's center position.
	 * - onUpdate: Updates the joystick's position and ensures it does not exceed the max distance.
	 * - onEnd: Returns the joystick to the center position with a spring animation.
	 */
	const joystickPanGesture = Gesture.Pan()
		.maxPointers(1)
		.onStart((event) => {
			opacity.value = withTiming(0.25, { duration: 400 }); // Fade out slowly after release
			start0.value = true;
			startX.value = right ? event.absoluteX - (3 * width) / 4 : event.absoluteX - width / 4;
			startY.value = event.absoluteY - height / 2;
			controllerCenterX.value = right ? event.absoluteX - (3 * width) / 4 : event.absoluteX - width / 4;
			controllerCenterY.value = event.absoluteY - height / 2;
		})
		.onUpdate((event) => {
			const deltaX = event.translationX - controllerCenterX.value + startX.value;
			const deltaY = event.translationY - controllerCenterY.value + startY.value;

			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > maxDistance) {
				// Calculate the excess distance
				const excessX = deltaX - maxDistance * (deltaX / distance);
				const excessY = deltaY - maxDistance * (deltaY / distance);

				// Update the controller center to "pull" it along with the joystick
				controllerCenterX.value += excessX;
				controllerCenterY.value += excessY;

				// Keep the joystick at the boundary
				joystickPositionX.value = maxDistance * (deltaX / distance);
				joystickPositionY.value = maxDistance * (deltaY / distance);
				// Assuming onStateChange is a prop function you want to call from here
			} else {
				joystickPositionX.value = deltaX;
				joystickPositionY.value = deltaY;
			}
			// Calculate the angle in radians, then convert to degrees
			const angleRadians = Math.atan2(deltaY, deltaX);
			const angleDegrees = angleRadians * (180 / Math.PI);

			const newState = {
				x: joystickPositionX.value / 10,
				y: joystickPositionY.value / 10,
				rotation: angleDegrees, // Add the rotation to the state
			};

			runOnJS(startContinuousUpdate)(deltaX, deltaY);

			if (!right) {
				runOnJS(onStateChange)(newState);
			}
		})
		.onEnd(() => {
			// Calculate the final rotation
			const angleRadians = Math.atan2(joystickPositionY.value, joystickPositionX.value);
			const angleDegrees = angleRadians * (180 / Math.PI);

			// Send the final update with the last direction
			const finalState = {
				x: 0,
				y: 0,
				rotation: angleDegrees,
			};
			runOnJS(onStateChange)(finalState);

			// Reset joystick positions
			joystickPositionX.value = withSpring(0);
			joystickPositionY.value = withSpring(0);
			opacity.value = withTiming(0.5, { duration: 500 });

			runOnJS(stopContinuousUpdate)();
		});

	// Ensure interval is cleared when the component unmounts
	useEffect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [intervalId]);

	return (
		<GestureDetector gesture={joystickPanGesture}>
			<View style={[styles.container, { left: right ? width / 2 : 0, backgroundColor: right ? 'rgba(0,0,0,1)' : 'white' }]}>
				<Animated.View style={[styles.joystickBase, joystickBaseStyle]}>
					<Animated.View style={[styles.joystick, joystickStyle]} />
				</Animated.View>
			</View>
		</GestureDetector>
	);
}

// StyleSheet for the controller and joystick styles.
const styles = StyleSheet.create({
	start: {
		height: 5,
		width: 5,
		backgroundColor: 'black',
		position: 'absolute',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: height,
		width: width / 2,
		borderWidth: 2,
		position: 'absolute',
		top: 0,
	},
	joystickBase: {
		width: 200,
		height: 200,
		backgroundColor: 'rgba(125,125,125,125.1)',
		borderRadius: 100,
		position: 'absolute',
	},
	joystick: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: 'rgb(75, 75, 75)',
		position: 'absolute',
	},
});
