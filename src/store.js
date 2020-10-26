import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import chatReducer  from './reducers/chatReducer';
// import { getFirebase} from 'react-redux-firebase'
// import { getFirestore} from 'redux-firestore'

const rootReducer = combineReducers({
    chatReducer: chatReducer
});

const configureStore = () => createStore(rootReducer, applyMiddleware(thunk));

export default configureStore;