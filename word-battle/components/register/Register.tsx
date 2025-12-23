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
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="User name" {...field} />
                </FormControl>
                <FormDescription>This is your name.</FormDescription>
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

          {state?.error && (
            <div className="p-3 bg-destructive/15 border border-destructive text-destructive text-sm rounded-md">
              {state.error}
            </div>
          )}

          <Button type="submit">{pending ? <Spinner/> : 'Submit'}</Button>
        </form>
      </Form>
    </div>
  );
}