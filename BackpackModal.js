import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('screen');

const BackpackModal = ({ visible, setVisible, backpackItems }) => {
	// Function to render backpack items
	const renderBackpackItems = () => {
		if (Object.keys(backpackItems)?.length > 0) {
			return Object.keys(backpackItems).map((key) => (
				<Text key={key} style={styles.itemText}>
					{key}: {JSON.stringify(backpackItems[key])}
				</Text>
			));
		} else {
			console.log('no hit');
			return <Text style={styles.itemText}>backpack empty</Text>;
		}
	};

	return (
		// <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => setVisible(false)}>
		visible ? (
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<ScrollView>{renderBackpackItems()}</ScrollView>
					<TouchableOpacity style={styles.button} onPress={() => setVisible(false)}>
						<Text style={styles.textStyle}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		) : null
		// </Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		height: width,
		width: height / 2,
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		marginTop: 15,
		backgroundColor: '#2196F3',
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	itemText: {
		marginBottom: 15,
		textAlign: 'center',
	},
});

export default BackpackModal;
