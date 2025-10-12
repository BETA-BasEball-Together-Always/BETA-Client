import {create} from "zustand";

const counterStore=create((set)=>({ //create는 store를 생성함
    count:1,
    increase:()=>set((state)=>({count:state.count+1})),
    decrease:()=>set((state)=>({count:state.count-1})),
    increaseBy:(value)=>set((state)=>({
        count:state.count+value,
    }))
}));

export default counterStore;