import { create } from "zustand";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/api";

 

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (userName, email, password) => {
    

    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });
      const data = await response.json();
 
      if (!response.ok) throw new Error(data.message) || "Something went wrong";
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };

    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },
  
  checkAuth: async () => {
    try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;
        if(!token || !user) return {success:false,user:null,token:null};
       
        set({user:user,token:token})
       
        

    } catch (error) {
        console.log("Error in checkAuth:",error);
    }
  },

  login: async (email,password) => {
 
    set({isLoading:true})
    try {
        const response =await fetch(`${API_BASE_URL}/api/auth/login`,{
            
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password})
        })
        const data = await response.json();
        console.log("Data in login:",data);
     

        if(!response.ok) throw new Error(data.message) || "Something went wrong";

        await AsyncStorage.setItem("user",JSON.stringify(data.user));
        await AsyncStorage.setItem("token",data.token);
        set({user:data.user,token:data.token,isLoading:false});
        return {success:true,user:data.user,token:data.token};
        
    } catch (error) {
        set({isLoading:false});
        return {success:false,message:error.message};
        
    }

  },
  logout: async () => {
    try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({token:null,user: null});

    } catch (error) {

        console.log("Error in logout:",error);
    }
  }
}));
