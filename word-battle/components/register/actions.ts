"use server"

import { registerSchema } from "@/schemas/register.schema";
import z from "zod";
import { redirect } from "next/navigation";
import { register } from "@/services/register/register.service";

export async function registerAction(prevState: any, formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { 
      error: "Invalid Data.", 
      details: z.flattenError(result.error).fieldErrors 
    };
  };

  const { name, email, password } = result.data;
  let isSuccessful = false;

  try {
    const  {success, error}= (await register(name, email, password));

    if(!success) return {success, error};

    isSuccessful = true;
  } catch (e) {
    console.log(e);
  }

  if(isSuccessful) redirect("/home");
}