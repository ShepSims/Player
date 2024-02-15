import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const BackpackModal = ({ visible, setVisible, backpackItems }) => {
	// Function to render backpack items
	const renderBackpackItems = () => {
		return Object.keys(backpackItems).map((key) => (
			<Text key={key} style={styles.itemText}>
				{key}: {JSON.stringify(backpackItems[key])}
			</Text>
		));
	};

	return (
		<Modal animationType='slide' transparent={true} visible={visible} onRequestClose={() => setVisible(false)}>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<ScrollView>{renderBackpackItems()}</ScrollView>
					<TouchableOpacity style={styles.button} onPress={() => setVisible(false)}>
						<Text style={styles.textStyle}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
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
