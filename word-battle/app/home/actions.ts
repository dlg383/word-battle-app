"use server"
import { clientEnv } from "@/env";

export async function meAction(){
   const res = await fetch(`${clientEnv.env.NEXT_PUBLIC_URL}/api/auth/me`);

   const data = await res.json();

   return data;
}