import { createSessionCookie } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

export async function register(name: string, email: string, password: string){
  await dbConnect();
  
  const exists = await User.findOne({ email });
  if (exists){
    return { 
      success: false,
      error: "Email already registered." 
    };
  } 

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ userName: name, email, passwordHash });

  await createSessionCookie({ sub: String(user._id), email: user.email, name: user.userName });
  
  return {
    success: true,
    error: null
  }
}