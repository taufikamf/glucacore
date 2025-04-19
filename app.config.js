module.exports = {
  name: "glucacore",
  slug: "glucacore",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-new.png",
    resizeMode: "cover",
    backgroundColor: "#70747D"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    requireFullScreen: true,
    splash: {
      image: "./assets/splash-new.png",
      resizeMode: "cover",
      backgroundColor: "#70747D"
    },
    infoPlist: {
      NSPhotoLibraryUsageDescription: "This app needs access to your photo library to set your profile picture",
      NSCameraUsageDescription: "This app needs access to your camera to take profile photos"
    },
    bundleIdentifier: "com.w3itexperts.glucacore"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.w3itexperts.glucacore",
    permissions: [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.CAMERA",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.RECORD_AUDIO"
    ],
    config: {
      googleMaps: {
        apiKey: "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: true
      }
    ],
    [
      "expo-screen-orientation",
      {
        initialOrientation: "DEFAULT"
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app needs access to your photos to set your profile picture",
        cameraPermission: "The app needs access to your camera to take profile photos"
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "2b30e12f-654b-493a-94ad-065a34548e9a"
    }
  }
}; 