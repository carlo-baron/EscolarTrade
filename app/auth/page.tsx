import { Logo } from "@/components/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { SignUpForm } from "@/components/Auth/SignUpForm";
import { AuthErrorDetector } from "@/components/Auth/AuthErrorDetector";
import { LoginForm } from "@/components/Auth/LoginForm";
import { Suspense } from "react";

interface AuthPageProps {
	searchParams: Promise<{
		tab?: string | string[],
		error?: string | string[],
	}>
}

export default async function AuthPage({ searchParams } : AuthPageProps){
	const { tab, error } = await searchParams;

	const activeTab = tab === "login" || error ? "login" : "signup";

	return(
		<>
			<Suspense fallback={null}><AuthErrorDetector /></Suspense>
			<main className='w-full gap-8 flex flex-col items-center py-4 px-4 lg:px-8'>
				<Logo />
				<Card className="max-w-lg w-full">
					<CardHeader>
						<div className="text-center">
							<CardTitle>
								<h1 className="font-bold text-2xl">Welcome Back Escolarian!</h1>
							</CardTitle>
							<CardDescription>
								The verified peer-to-peer campus marketplace for Centro Escolar University Malolos.
							</CardDescription>
						</div>
						<CardContent className="pt-4">
							<Tabs 
								key={activeTab} defaultValue={activeTab}>
								<TabsList className='w-full'>
									<TabsTrigger value="login">Log In</TabsTrigger>
									<TabsTrigger value="signup">Sign Up</TabsTrigger>
								</TabsList>
								<TabsContent value="login">
									<LoginForm unverifiedHint={error === "unverified"} />
								</TabsContent>
								<TabsContent value="signup">
									<SignUpForm />
								</TabsContent>
							</Tabs>
						</CardContent>
					</CardHeader>
				</Card>
			</main>
		</>
	);
}
