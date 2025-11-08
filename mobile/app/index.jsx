import { Text, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import{Link} from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello Native</Text>
      <Image source={require("../assets/images/icon.png")} style={styles.image} contentFit="contain" />
      <Link href="/login" style={styles.loginButton}>Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
    container:{
      flex:1,
      justifyContent:"center",
      alignItems:"center",
    },
    title:{
      color:"red",
    },
    image:{
      width:100,
      height:100,
    }

})
