import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Modal UI for adding item attributes
export function AddItemModal({ visible, setVisible, add }) {
	const [name, setName] = useState('');
	const [attack, setAttack] = useState('');
	const [quantity, setQuantity] = useState('');
	const [reusable, setReusable] = useState(false);

	return (
		<Modal
			animationType='slide'
			transparent={true}
			visible={visible}
			onRequestClose={() => {
				setVisible(!visible);
			}}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<TextInput placeholder='Enter  name' onChangeText={setName} value={name} style={styles.modalTextInput} />
					<TextInput
						placeholder='Enter  attack'
						onChangeText={setAttack}
						value={attack}
						keyboardType='numeric'
						style={styles.modalTextInput}
					/>
					<TextInput
						placeholder='Enter  quantity'
						onChangeText={setQuantity}
						value={quantity}
						keyboardType='numeric'
						style={styles.modalTextInput}
					/>
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ color: 'black', marginRight: 10 }}>Reusable</Text>
						<TouchableOpacity
							style={{ borderWidth: 1, backgroundColor: reusable ? 'black' : 'white', height: 20, width: 20, marginBottom: 25 }}
							onPress={() => {
								setReusable(!reusable);
							}}
						></TouchableOpacity>
					</View>
					<TouchableOpacity
						style={[styles.button, styles.buttonClose]}
						onPress={() => {
							add({ name: name, attack: attack, quantity: quantity, reusable: reusable });
							setName('');
							setAttack('');
							setQuantity('');
							setReusable(false);
						}}
					>
						<Text style={styles.textStyle}>Add to Backpack</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={{ position: 'absolute', top: 10, right: 10, height: 25, width: 25, alignItems: 'center', justifyContent: 'center' }}
						onPress={() => {
							setName('');
							setAttack('');
							setQuantity('');
							setReusable(false);
							setVisible(false);
						}}
					>
						<Text style={{ color: 'black', fontSize: 20 }}>x</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

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
	},
	buttonOpen: {
		backgroundColor: '#F194FF',
	},
	buttonClose: {
		backgroundColor: '#2196F3',
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalTextInput: {
		marginBottom: 15,
		borderWidth: 1,
		padding: 10,
		width: '100%',
	},
});
