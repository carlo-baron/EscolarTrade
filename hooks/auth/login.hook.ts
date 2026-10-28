import { auth } from "@/lib/firebase"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { clearSession, createSession } from "@/app/auth/session.server"
import { authRedirect } from "@/lib/auth/policy"

export function useLogin() {
  const router = useRouter()

  return async (email: string, password: string) => {
    await clearSession()
    const credential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    )
    const result = await createSession(await credential.user.getIdToken(true))
    if (!result.success) {
      if (result.error === "unavailable")
        throw new Error(
          "Unable to start your session. Please try logging in again."
        )
      if (result.error !== "unverified") await signOut(auth)
      router.replace(authRedirect(result.error))
      return result
    }
    router.replace("/marketplace")
    router.refresh()
    return result
  }
}
