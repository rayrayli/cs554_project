import firebaseApp from './Firebase';
import firebase from 'firebase/app';
import axios from 'axios'

async function doCreateUserWithEmailAndPassword(email, password, displayName, info) {
    await firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(async (res) => {
            info.uid = res.user.uid;

            // Create MongoDB User
            await axios({
                method: 'POST',
                url:'http://localhost:3001/users/',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                data: info
            }).then( (res) => {
                console.log(res)
            });
        });

    firebase.auth().currentUser.updateProfile({ displayName: displayName });
    return firebase.auth().currentUser.uid;
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
    };
    await firebase.auth().signInWithPopup(socialProvider);
};

async function doPasswordReset(email) {
    await firebase.auth().sendPasswordResetEmail(email);
};

async function doSignOut() {
    await firebase.auth().signOut();
};

async function doUpdateEmail(newEmail) {
    await firebase.auth().currentUser.updateEmail(newEmail);
};

async function deleteAccount() {
    let uid = firebase.auth().currentUser.uid;

    await firebase.auth().currentUser.delete()
        .then(async (res) => {
            // Delete MongoDB User
            await axios.get(`http://localhost:3001/users/${uid}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }).then((conf) => {
                console.log('User Deleted');
            });
        });
};

async function reauthenticate(currentPassword) {
    var user = firebase.auth().currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
};

async function onAuthUserListen(next, redirect) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('GETTING DBUSER TO MERGE WITH AUTH USER...');

            try {
                await axios.get(`http://localhost:3001/users/${user.uid}`)
                    .then((data) => {
                        console.log('ACQUIRED DBUSER',data);

                        if (data.data) {
                            const currentUser = {
                                user: user,
                                dbUser: data.data,
                            };

                            console.log('DBUSER MERGED WITH AUTH');
                            next(currentUser);
                        };
                    });
            } catch (err) {
                return err;
            }
        } else {
            redirect();
        };
    });
};

export {
    doCreateUserWithEmailAndPassword,
    doSocialSignIn,
    doSignInWithEmailAndPassword,
    doPasswordReset,
    doSignOut,
    doChangePassword,
    doUpdateEmail,
    deleteAccount,
    reauthenticate,
    onAuthUserListen
};

// import firebaseApp from './Firebase';
// import firebase from 'firebase/app';
// import axios from 'axios'

// async function doCreateUserWithEmailAndPassword(email, password, displayName, info) {
//     await firebase.auth().createUserWithEmailAndPassword(email, password)
//         .then(async (res) => {
//             info.uid = res.user.uid;

//             // Create MongoDB User
//             await axios({
//                 method: 'POST',
//                 url: '/users/', 
//                 headers: {
//                     'Content-Type': 'application/json;charset=utf-8'
//                 },
//                 data: info
//             });
//         });

//     firebase.auth().currentUser.updateProfile({ displayName: displayName });
//     return firebase.auth().currentUser.uid;
// };

// async function doChangePassword(email, oldPassword, newPassword) {
//     let credential = firebase.auth.EmailAuthProvider.credential(email, oldPassword);
//     await firebase.auth().currentUser.reauthenticateWithCredential(credential);
//     await firebase.auth().currentUser.updatePassword(newPassword);
//     await doSignOut();
// };

// async function doSignInWithEmailAndPassword(email, password) {
//     await firebase.auth().signInWithEmailAndPassword(email, password);
// };

// async function doSocialSignIn(provider) {
//     let socialProvider = null;
//     if (provider === 'google') {
//         socialProvider = new firebase.auth.GoogleAuthProvider();
//     };
//     await firebase.auth().signInWithPopup(socialProvider);
// };

// async function doPasswordReset(email) {
//     await firebase.auth().sendPasswordResetEmail(email);
// };

// async function doSignOut() {
//     await firebase.auth().signOut();
// };

// async function doUpdateEmail(newEmail) {
//     await firebase.auth().currentUser.updateEmail(newEmail);
// };

// async function deleteAccount() {
//     let uid = firebase.auth().currentUser.uid;

//     await firebase.auth().currentUser.delete()
//         .then(async (res) => {
//             // Delete MongoDB User
//             await axios({
//                 method: "DELETE",
//                 url: `/users/${uid}`, 
//                 headers: {
//                     'Content-Type': 'application/json;charset=utf-8'
//                 }
//             }).then((conf) => {
//                 console.log('User Deleted');
//             });
//         });
// };

// async function reauthenticate(currentPassword) {
//     var user = firebase.auth().currentUser;
//     var cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
//     return user.reauthenticateWithCredential(cred);
// };

// async function onAuthUserListen(next, redirect) {
//     firebase.auth().onAuthStateChanged(async (user) => {
//         if (user) {
//             console.log('GETTING DBUSER TO MERGE WITH AUTH USER...');

//             try {
//                 await axios.get(`/users/${user.uid}`)
//                     .then((data) => {
//                         console.log('ACQUIRED DBUSER');
//                         console.log(data)

//                         if (data) {
//                             const currentUser = {
//                                 user: user,
//                                 dbUser: data.data,
//                             };

//                             console.log('DBUSER MERGED WITH AUTH');
//                             next(currentUser);
//                         };
//                     });
//             } catch (err) {
//                 return err;
//             }
//         } else {
//             redirect();
//         };
//     });
// };

// export {
//     doCreateUserWithEmailAndPassword,
//     doSocialSignIn,
//     doSignInWithEmailAndPassword,
//     doPasswordReset,
//     doSignOut,
//     doChangePassword,
//     doUpdateEmail,
//     deleteAccount,
//     reauthenticate,
//     onAuthUserListen
// };