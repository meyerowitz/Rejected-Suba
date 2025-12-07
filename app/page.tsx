import { useRootNavigationState, useRouter } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"

export default function Page() {
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()

  useEffect(() => {
    // Wait for navigation to be ready
    if (!rootNavigationState?.key) return

    // Redirect to login page as the entry point
    router.replace("/login")
  }, [rootNavigationState?.key, router])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#FFA311" />
    </View>
  )
}