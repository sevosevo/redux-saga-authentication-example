import { put, take, call, fork, cancel, cancelled } from 'redux-saga/effects';
//Fake database
const users = [{username: 'admin', password:'admin'}];
/*---------------------------*/


//file: ROOT/types.js
//Types file
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const RESET_LOADING = 'RESET_LOADING';
export const LOGOUT = 'LOGOUT';
/*---------------------------*/


// file: ROOT/sagas/authentication.js
// Sagas
const clearToken = () => {
	if(localStorage.getItem('token'))
		localStorage.removeItem('token');
}

function* authenticationFlow(username, password) {
	try{
		const asyncCode = yield call(
			() => new Promise((resolve,reject)=>setTimeout(()=> resolve(), 5000))
		); //Simulate async function 
		const u = users.find(user => user.username === username && user.password === password);
		if( !u ) return yield put({ type: LOGIN_ERROR });
		yield put({ type: LOGIN_SUCCESS, user: {username, password} });
		//Add token to localStorage
		localStorage.setItem('token', 'jibrishhh');
	}catch(error) {
		console.log(error);
		yield put({  type: LOGIN_ERROR });
	}finally{
		if(yield cancelled()) {
			yield put({ type: RESET_LOADING });
		}
	}
}

function* loginFlow () {
		while(true){
			//From login request we expect to get two action values: username, password
			const {user: {username, password} } = yield take(LOGIN_REQUEST); 
			//We are running authentication flow which is ajax request/response function
			const loginTask = yield fork(authenticationFlow, username, password);
			//Wait for logout or login error action type 
			const action = yield take([LOGOUT, LOGIN_ERROR]);
			if(action.type === LOGOUT) 
				yield cancel(loginTask);
			//Clear token from localStorage
			yield call(clearToken);
		}
}

export default loginFlow; 
/*---------------------------*/


//File: ROOT/sagas/index.js
//Merge sagas
export const function * () {
	yield all(
		fork(loginFlow);
	);
}
/*---------------------------*/


// File: ROOT/actions/authentication.js 
//Authentication action creator
const login = formData => ({
	type: LOGIN_REQUEST,
	user: formData
});
const logout = () => ({
	type: LOGOUT
});

