"use client";

import Login from "@/components/login/Login";
import Register from "@/components/register/Register";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
	return (
		<div className="flex min-h-screen  justify-center bg-slate-50 p-4">
			<Card className="w-full max-w-md h-fit shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-2xl font-bold tracking-tight">Bienvenido</CardTitle>
					<CardDescription>
						Ingresa tus credenciales para acceder a tu cuenta
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-8">
							<TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
							<TabsTrigger value="register">Registro</TabsTrigger>
						</TabsList>

						<TabsContent value="login" className="mt-0">
							<Login />
						</TabsContent>

						<TabsContent value="register" className="mt-0">
							<Register />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}