"use server"

import { loginSchema } from "@/schemas/login.schema";
import z from "zod";
import { redirect } from "next/navigation";
import { loggued } from "@/services/login/login.service";

export async function loginAction(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { 
      error: "Invalid Data.", 
      details: z.flattenError(result.error).fieldErrors 
    };
  };

  const { email, password } = result.data;
  let isSuccessful = false;

  try {
    const  {success, error}= (await loggued(email, password));

    if(!success) return {success, error};

    isSuccessful = true;
  } catch (e) {
    console.log(e);
  }

  if(isSuccessful) redirect("/home");
}