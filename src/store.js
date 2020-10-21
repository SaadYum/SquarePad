import {createStore, combineReducers} from 'redux';
import chatReducer  from './reducers/chatReducer';

const rootReducer = combineReducers({
    chatReducer: chatReducer
});

const configureStore = () => createStore(rootReducer);

export default configureStore;