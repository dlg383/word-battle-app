import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../ui/form";
import { Input } from "../ui/input";
import z from "zod";
import { Button } from "../ui/button";
import { registerSchema } from "@/schemas/register.schema";
import { registerAction } from "./actions";
import { startTransition, useActionState } from "react";
import { Spinner } from "../ui/spinner";

export default function Register() {
  const [state, action, pending] = useActionState(registerAction, null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  });

  const handleFormSubmit = (data: z.infer<typeof registerSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name)
    formData.append("email", data.email);
    formData.append("password", data.password);

    console.log("llamada server");

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="User name" {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} className="bg-white" />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Your Password" {...field} className="bg-white" />
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
    </div>
  );
}