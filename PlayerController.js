import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PlayerController() {
	const dotPosition = useRef(new Animated.ValueXY()).current;
	const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
	const moving = useRef(false);
	const velocity = useRef({ x: 0, y: 0 });
	const animationFrameId = useRef(null);

	// Function to update the dot's position based on velocity
	const updatePosition = () => {
		const move = () => {
			dotPosition.setValue({
				x: dotPosition.x._value + velocity.current.x,
				y: dotPosition.y._value + velocity.current.y,
			});

			if (moving.current) {
				animationFrameId.current = requestAnimationFrame(move);
			} else {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
		move();
	};

	const onTouchStart = (event) => {
		const { locationX, locationY } = event.nativeEvent;
		setStartPosition({ x: locationX, y: locationY });
		moving.current = true;
	};
	const maxSpeed = 0.075; // Define the maximum speed

	const onTouchMove = (event) => {
		const { locationX, locationY } = event.nativeEvent;
		const dx = locationX - startPosition.x;
		const dy = locationY - startPosition.y;

		// Calculate raw velocity based on distance moved
		let xVelocity = dx / 500;
		let yVelocity = dy / 500;

		// Calculate the magnitude of the velocity vector
		const velocityMagnitude = Math.sqrt(xVelocity * xVelocity + yVelocity * yVelocity);

		// If the calculated speed exceeds maxSpeed, scale down the x and y components of the velocity
		if (velocityMagnitude > maxSpeed) {
			const scalingFactor = maxSpeed / velocityMagnitude;
			xVelocity *= scalingFactor;
			yVelocity *= scalingFactor;
		}

		// Update velocity with potentially scaled values
		velocity.current = { x: xVelocity, y: yVelocity };

		if (moving.current) {
			updatePosition();
		}
	};
	const onTouchEnd = () => {
		moving.current = false;
		if (animationFrameId.current) {
			cancelAnimationFrame(animationFrameId.current);
		}
		// Optionally reset velocity and dot position here
	};

	useEffect(() => {
		// Cleanup on component unmount
		return () => {
			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, []);

	return (
		<View
			style={styles.container}
			onStartShouldSetResponder={() => true}
			onMoveShouldSetResponder={() => true}
			onResponderGrant={onTouchStart}
			onResponderMove={onTouchMove}
			onResponderRelease={onTouchEnd}
		>
			<Animated.View
				style={[
					styles.dot,
					{
						transform: dotPosition.getTranslateTransform(),
					},
				]}
			/>
			<View
				style={{
					height: 10,
					width: 10,
					position: 'absolute',
					left: startPosition.x,
					top: startPosition.y,
					// transform: [{ translateX: startPosition.x }, { translateY: startPosition.y }],
					backgroundColor: 'black',
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
	},
	dot: {
		width: 20,
		height: 20,
		backgroundColor: 'red',
		position: 'absolute',
	},
});
