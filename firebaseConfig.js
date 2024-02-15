// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDM71KAoSD438pyc7FZHTMX14crkTMatj0',
	authDomain: 'player-6e5ab.firebaseapp.com',
	projectId: 'player-6e5ab',
	storageBucket: 'player-6e5ab.appspot.com',
	messagingSenderId: '920394479923',
	appId: '1:920394479923:web:00bffaf05f7bbde900a646',
	measurementId: 'G-HR1Z50XQD5',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
