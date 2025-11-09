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
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../constants/api";





export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      // Request permission for both platforms
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access your photo library to upload book images.",
          [{ text: "OK" }]
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Optimized quality for better performance
        base64: true,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
        setErrors(prev => ({ ...prev, image: null })); // Clear image error

        // Get base64
        if (selectedImage.base64) {
          setImageBase64(selectedImage.base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
            encoding: 'base64',
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log("Error in pickImage:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageBase64(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Book title is required";
    } else if (title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
    }

    if (!caption.trim()) {
      newErrors.caption = "Caption is required";
    } else if (caption.trim().length < 10) {
      newErrors.caption = "Caption must be at least 10 characters";
    }

    if (!imageBase64) {
      newErrors.image = "Book image is required";
    }

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = "Please select a rating";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate form
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly");
      return;
    }

    try {
      setIsLoading(true);

      // Get file extension and create data URL
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

    //   console.log("Submitting book...");
    //   console.log("Title:", title.trim());
    //   console.log("Rating:", rating);
    //   console.log("Caption length:", caption.trim().length);

      const response = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim(),
          image: imageDataUrl,
          rating
        })
      });

      const data = await response.json();
    //   console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create book");
      }

      // Success!
      Alert.alert(
        "Success! 🎉",
        "Your book has been created successfully",
        [
          {
            text: "View Books",
            onPress: () => {
              // Reset form
              setTitle("");
              setCaption("");
              setRating(3);
              setImage(null);
              setImageBase64(null);
              setErrors({});
              router.push("/(tabs)");
            }
          }
        ]
      );
    } catch (error) {
      console.log("Error in handleSubmit:", error);
      Alert.alert(
        "Error",
        error.message || "Something went wrong. Please try again.",
        [{ text: "OK" }]
      );
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
            <Text style={styles.label}>Book Title *</Text>
            <View style={[styles.inputContainer, errors.title && { borderColor: '#ff3b30' }]}>
              <Ionicons
                name="book-outline"
                size={20}
                color={errors.title ? '#ff3b30' : COLORS.textPrimary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter book title"
                placeholderTextColor={COLORS.placeholderText}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                maxLength={100}
              />
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>
          {/* rating */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Rating *</Text>
            {renderRatingPicker()}
            {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}
          </View>

          {/* image */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Book Cover Image *</Text>
            <TouchableOpacity 
              style={[styles.imagePicker, errors.image && { borderColor: '#ff3b30' }]} 
              onPress={pickImage}
              disabled={isLoading}
            >
              {image ? (
                <View style={{ width: '100%', height: '100%' }}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  {!isLoading && (
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                    >
                      <Ionicons name="close-circle" size={28} color="#ff3b30" />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons
                    name="image-outline"
                    size={48}
                    color={errors.image ? '#ff3b30' : COLORS.textSecondary}
                  />
                  <Text style={[styles.placeholderText, errors.image && { color: '#ff3b30' }]}>
                    Tap to select a book cover image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
          </View>
          {/* caption */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Caption *</Text>
            <TextInput
              style={[styles.textArea, errors.caption && { borderColor: '#ff3b30' }]}
              placeholder="Share your thoughts about this book... (min 10 characters)"
              placeholderTextColor={COLORS.placeholderText}
              value={caption}
              onChangeText={(text) => {
                setCaption(text);
                if (errors.caption) setErrors(prev => ({ ...prev, caption: null }));
              }}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.captionFooter}>
              {errors.caption && <Text style={styles.errorText}>{errors.caption}</Text>}
              <Text style={styles.charCount}>{caption.length}/500</Text>
            </View>
          </View>

          {/* submit button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.buttonText, { marginLeft: 10 }]}>Creating...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={22}
                  color={COLORS.white}
                />
                <Text style={[styles.buttonText, { marginLeft: 8 }]}>Create Book</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
