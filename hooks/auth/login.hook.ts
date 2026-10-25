import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export function useLogin() {
	const router = useRouter();

	return async (email: string, password: string) => {
		try{
			const credential = await signInWithEmailAndPassword(auth, email, password);
			const user = credential.user;

			if(user) router.push("/marketplace");
		}catch(error){
			throw error;
		}
	}
}
