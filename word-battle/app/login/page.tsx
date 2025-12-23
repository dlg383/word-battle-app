"use client";

import Login from "@/components/login/Login";
import Register from "@/components/register/Register";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";

export default function Page() {
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