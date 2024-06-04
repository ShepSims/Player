import { View } from 'react-native';
import React from 'react';

export const ProjectileComponent = ({ projectile }) => {
	// Only render if the projectile is active
	if (!projectile.active) return null;

	// Projectile style with dynamic positioning
	const projectileStyle = {
		position: 'absolute',
		width: 10,
		left: 5,
		height: 10,
		rop: 5,
		backgroundColor: 'red',
		left: projectile.x,
		top: projectile.y,
		transform: [{ rotate: `${projectile.rotation}deg` }],
	};

	return <View style={projectileStyle} />;
};
