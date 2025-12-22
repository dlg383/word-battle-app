"use client";
import Login from "@/components/login/Login";
import Register from "@/components/register/Register";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";

type MeResponse =
	| { user: null }
	| { user: { id: string; email: string; name: string } };

export default function Page() {
	// session
	const [meLoading, setMeLoading] = useState(false);
	const [me, setMe] = useState<MeResponse | null>(null);
	const [meError, setMeError] = useState<String | null>(null);

	// register
	const [rName, setRName] = useState("");
	const [rEmail, setREmail] = useState("");
	const [rPass, setRPass] = useState("");
	const [rLoading, setRLoading] = useState(false);

	// login
	const [lemail, setLEmail] = useState("");
	const [lPass, setLPass] = useState("");
	const [lLoading, setLLoading] = useState(false);

	const loadMe = async () => {
		setMeLoading(true);
		setMeError(null);

		try {
			const res = await fetch("/api/auth/me");
			const data = await res.json();
			setMe(data);
		} catch (e: any) {

		}
	}

	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<Tabs defaultValue="login">
				<TabsList>
					<TabsTrigger value="login">Login</TabsTrigger>
					<TabsTrigger value="register">Register</TabsTrigger>
				</TabsList>

				<TabsContent value="login">
					<Login />
				</TabsContent>

				<TabsContent value="register">
					<Register/>
				</TabsContent>
			</Tabs>
		</div>
	)

}