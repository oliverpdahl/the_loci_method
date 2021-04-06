import firebase from 'firebase/app'
require('firebase/auth')
require('firebase/database')

// firebase config can be found in your firebase project
const firebaseConfig = {
  apiKey: 'AIzaSyCpXTmTqRz0S4IptbHHoL-kXrWKiaeAqhA',
  authDomain: 'the-loci-method.firebaseapp.com',
  databaseURL: 'https://the-loci-method-default-rtdb.firebaseio.com',
  projectId: 'the-loci-method',
  storageBucket: 'the-loci-method.appspot.com',
  messagingSenderId: '1078236159163',
  appId: '1:1078236159163:web:13ffe735647a2228ee5d9e'
}

firebase.initializeApp(firebaseConfig)
if (process.env.NODE_ENV !== 'production') {
  firebase.auth().useEmulator('http://localhost:9099')
  firebase
    .auth()
    .signInWithCredential(
      firebase.auth.EmailAuthProvider.credential('john@doe.com', '123123')
    )
}

export default firebase
