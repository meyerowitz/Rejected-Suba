"use client"

import * as Google from "expo-auth-session/providers/google"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useEffect, useState } from "react"
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

WebBrowser.maybeCompleteAuthSession()

export default function Login() {
  const router = useRouter()
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  const [request, response, promptAsync] = Google.useAuthRequest({
    // This is the Mobile app OAuth 2.0 Client ID from Google Cloud Console
    clientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
      "833295268120-h7ing9lqfm2bk46qvtg381vrnt22tsv9.apps.googleusercontent.com",
  })

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response
      if (authentication?.accessToken) {
        handleGoogleLogin(authentication.accessToken)
      }
    }
  }, [response])

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      setIsLoadingGoogle(true)
      if (accessToken) {
        console.log("Google login successful")
        router.replace("/(tabs)")
      }
    } catch (error) {
      console.error("Google login error:", error)
      Alert.alert("Error", "Google login failed")
    } finally {
      setIsLoadingGoogle(false)
    }
  }

  const handleLogin = async () => {
    try {
      if (true) {
        router.replace("/(tabs)")
      } else {
      }
    } catch (error) {
      console.error(error)
      Alert.alert("Error de red")
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image source={require("@/assets/images/logo.png")} style={styles.wordmark} />
        </View>
        <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
        <TextInput placeholder="Correo electrónico" value={correo} onChangeText={setCorreo} style={styles.input} />
        <TextInput
          textContentType="password"
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        <Text style={styles.question}>¿Olvidaste tu contraseña?</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.textButton}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.googleButton, isLoadingGoogle && styles.googleButtonDisabled]}
          onPress={() => promptAsync()}
          disabled={isLoadingGoogle || !request}
        >
          <Image source={require("@/assets/images/google.png")} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>{isLoadingGoogle ? "Conectando..." : "Continuar con Google"}</Text>
        </TouchableOpacity>
        <View style={styles.redirect}>
          <Text style={styles.question}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.register}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    alignItems: "center",
    justifyContent: "center",
    width: 320,
    height: 88.28,
    marginTop: 50,
    marginBottom: 50,
  },
  wordmark: {
    width: 320,
    height: 88.28,
  },
  title: {
    fontSize: 30,
    fontFamily: "roboto",
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 60,
  },
  input: {
    width: 320,
    height: 60,
    padding: 10,
    borderWidth: 1,
    borderColor: "#DFDFDF",
    borderRadius: 100,
    fontFamily: "roboto",
    fontSize: 18,
    marginBottom: 20,
  },
  question: {
    color: "#544F4F",
    fontFamily: "roboto",
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    display: "flex",
    marginTop: 20,
    width: 320,
    height: 60,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFA311",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textButton: {
    color: "#023A73",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "roboto",
  },
  googleButton: {
    display: "flex",
    flexDirection: "row",
    marginTop: 20,
    width: 320,
    height: 60,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#212121",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "roboto",
  },
  redirect: {
    width: 320,
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  register: {
    color: "#0661BC",
    fontFamily: "roboto",
    fontWeight: "bold",
    fontSize: 16,
    textDecorationLine: "underline",
  },
})