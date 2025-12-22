import { useForm } from "react-hook-form";
import { useActionState, startTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../ui/form";
import { Input } from "../ui/input";
import { loginSchema } from "@/schemas/login.schema";
import z from "zod";
import { Button } from "../ui/button";
import { login } from "./actions";
import { Spinner } from "../ui/spinner";

export default function Login() {
	const [state, action, pending] = useActionState(login, null);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: ""
		},
	});


	return (
		<div>
			<Form {...form}>
				<form action={action} className="space-y-8">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="example@example.com" {...field} />
								</FormControl>
								<FormDescription>This is your email.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input placeholder="Your Password" {...field} />
								</FormControl>
								<FormDescription>This is your secret password.</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">{pending ? <Spinner/> : 'Submit'}</Button>
				</form>
			</Form>
		</div>
	);
}