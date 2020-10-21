import { testAction } from '../actions/chatActions';
import {TEST_ACTION} from '../actions/types';


const initialState = {

    chats: [{data:"one"},{data:"one"},{data:"one"}],
    testData: "Something"
}

 const chatReducer = (state = initialState, action ) =>{

    switch(action.type){
        case TEST_ACTION:
            return{
                ...state,
                
                chats: state.chats.concat({
                    key: Math.random(),
                    data: action.data
                })
            }
            
        default:
            return state; 
    }}

    export default chatReducer;