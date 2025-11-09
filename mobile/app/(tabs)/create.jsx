import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../constants/api";





export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null); //to display the image
  const [imageBase64, setImageBase64] = useState(null); //to send the image to text to the backend
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const {token} = useAuthStore();

  const pickImage = async () => {
    try {
      // request permission to access the gallery
      if (Platform.OS === "android") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log({ status });

        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Please grant permission to access the gallery"
          );
          return;
        }
      }

      //   launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, //lower the quality of the image for base64
        base64: true,
      });
      if (!result.canceled) {
        console.log({ result });
        setImage(result.assets[0].uri);

        //    if base64 is provided use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          // otherwise convert to it
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log("Error in pickImage:", error);
      Alert.alert("Error", error.message);
    }
  };
  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={20}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const handleSubmit = async () => {
    if(!title || !caption || !imageBase64 || !rating) {
        Alert.alert("Error","All fields are required");
        return;
    }
    try {
         setIsLoading(true);
    //    get the file extention from uri  or default to jpeg
    const uriParts =image.split(".");
    const fileType = uriParts[uriParts.length - 1];
    const imageType= fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

    const imageDataUrl =`data:${imageType};base64,${imageBase64}`;

    const response = await fetch(`${API_BASE_URL}/api/books`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body:JSON.stringify({title,caption,image:imageDataUrl,rating})
    })
    const data = await response.json();
    console.log("Data in handleSubmit:",data);
    if(!response.ok) throw new Error(data.message);
    Alert.alert("Success","Book created successfully");
    router.push("/(tabs)");
    } catch (error) {
        console.log("Error in handleSubmit:",error);
        Alert.alert("Error",error.message);
    } finally {
        setIsLoading(false);
    }
   
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "android" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create a new book</Text>
            <Text style={styles.subtitle}>
              Share your favorite books with your friends
            </Text>
          </View>
          {/* book title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Book Title</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="book-outline"
                size={20}
                color={COLORS.textPrimary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter book title"
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>
          {/* rating */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rating</Text>
            {renderRatingPicker()}
          </View>

          {/* image */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.placeholderText}>
                    Click to select an image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          {/* caption */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write a caption for your book    "
              placeholderTextColor={COLORS.placeholderText}
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>
          {/* submit button */}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
