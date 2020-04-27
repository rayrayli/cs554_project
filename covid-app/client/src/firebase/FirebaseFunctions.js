import firebaseApp from './Firebase';
import firebase from 'firebase/app';

async function doCreateUserWithEmailAndPassword(email, password, displayName, _id) {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(async (res) => {
            await fetch(`/users/${_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    uid: firebase.auth().currentUser.uid,
                })
            });
        });

    firebase.auth().currentUser.updateProfile({ displayName: displayName });
    return firebase.auth().currentUser.uid
};

async function doChangePassword(email, oldPassword, newPassword) {
    let credential = firebase.auth.EmailAuthProvider.credential(email, oldPassword);
    await firebase.auth().currentUser.reauthenticateWithCredential(credential);
    await firebase.auth().currentUser.updatePassword(newPassword);
    await doSignOut();
};

async function doSignInWithEmailAndPassword(email, password) {
    await firebase.auth().signInWithEmailAndPassword(email, password);
};

async function doSocialSignIn(provider) {
    let socialProvider = null;
    if (provider === 'google') {
        socialProvider = new firebase.auth.GoogleAuthProvider();
    }
    await firebase.auth().signInWithPopup(socialProvider);
};

async function doPasswordReset(email) {
    await firebase.auth().sendPasswordResetEmail(email);
};

async function doSignOut() {
    await firebase.auth().signOut();
};

async function onAuthUserListen(next, redirect) {

    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            setTimeout(200);
            console.log('GETTING DBUSER TO MERGE WITH AUTH USER...:')

            try {
                await fetch(`/users/${user.uid}`)
                .then((res1) => res1.json())
                .then((data) => {
                    console.log('ACQUIRED DBUSER:')
                    if (data) {
                        const currentUser = {
                            user: user,
                            dbUser: data,
                        }

                        console.log('DBUSER MERGED WITH AUTH')
                        next(currentUser);
                    }
                });
            } catch (err) {
                return err
            }
        } else {
            redirect();
        }
    })

}

export {
    doCreateUserWithEmailAndPassword,
    doSocialSignIn,
    doSignInWithEmailAndPassword,
    doPasswordReset,
    doSignOut,
    doChangePassword,
    onAuthUserListen
};