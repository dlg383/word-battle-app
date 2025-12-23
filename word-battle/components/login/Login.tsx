import { useForm } from "react-hook-form";
import { useActionState, startTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../ui/form";
import { Input } from "../ui/input";
import { loginSchema } from "@/schemas/login.schema";
import z from "zod";
import { Button } from "../ui/button";
import { loginAction } from "./actions";
import { Spinner } from "../ui/spinner";

export default function Login() {
	const [state, action, pending] = useActionState(loginAction, null);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: ""
		},
	});

	// Esta función solo se ejecuta si la validación de Zod en el cliente PASA
	const handleFormSubmit = (data: z.infer<typeof loginSchema>) => {
		const formData = new FormData();
		formData.append("email", data.email);
		formData.append("password", data.password);

		console.log("llamada server");

		startTransition(() => {
			action(formData);
		});
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Correo Electrónico</FormLabel>
							<FormControl>
								<Input placeholder="nombre@ejemplo.com" {...field} className="bg-white" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contraseña</FormLabel>
							<FormControl>
								<Input type="password" placeholder="••••••••" {...field} className="bg-white" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{state?.error && (
					<div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium rounded-md animate-in fade-in zoom-in-95">
						{state.error}
					</div>
				)}

				<Button type="submit" className="w-full" disabled={pending}>
					{pending ? <Spinner className="mr-2 h-4 w-4" /> : null}
					{pending ? 'Cargando...' : 'Entrar'}
				</Button>
			</form>
		</Form>
	);
}