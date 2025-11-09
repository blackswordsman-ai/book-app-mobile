import { Platform } from "react-native";

const DEFAULT_BASE_URL =
  Platform.OS === "android" ? "https://book-app-mobile.onrender.com" : "https://book-app-mobile.onrender.com"; 
// Platform.OS === "android" ? "https://book-app-mobile.onrender.com" : "https://book-app-mobile.onrender.com";

export const API_BASE_URL = DEFAULT_BASE_URL;