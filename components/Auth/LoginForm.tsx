"use client";

import { PasswordInput } from "@/components/ui/password-input";
import {
  Field,
	FieldSet,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"
import Link from "next/link";
import { useLogin } from "@/hooks/auth/login.hook";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

export function LoginForm(){
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const login = useLogin();

	return(
		<form onSubmit={async (event) => {
			event.preventDefault();
			setSubmitting(true);
			setError("");

			const formData = new FormData(event.currentTarget);
			try{
				await login(formData.get("login-email") as string, formData.get("login-password") as string);
			}catch(error){
				if(error instanceof FirebaseError){
					if(error.code === "auth/invalid-credential")
					setError("Invalid email or password.");
				}
			}finally{
				setSubmitting(false);
			}
		}}>
			<FieldSet>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="login-email" className="flex gap-0">
							CEU Email Account<sup className="text-red-500">*</sup>
						</FieldLabel>
						<Input 
							id="login-email"
							name="login-email"
							type="email"
							pattern="[^\s@]+@mls\.ceu\.edu\.ph"
							placeholder="surnameXXXXXXX@mls.ceu.edu.ph"	
							required
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="login-password" className="flex gap-0">
							Password<sup className="text-red-500">*</sup>
						</FieldLabel>
						<PasswordInput 
							id="login-password"
							name="login-password"
							placeholder="••••••••"	
							required
						/>
						<FieldError>{error}</FieldError>
						<Link className="text-xs text-end" href="/auth/forgot-password">
							Forgot Password?
						</Link>
					</Field>
					<Field>
						<Button size="lg" type="submit" disabled={submitting}>
							Log In to EscolarTrade <ArrowRight />
						</Button>
					</Field>
				</FieldGroup>
			</FieldSet>
		</form>
	);
}
