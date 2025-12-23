import { SessionPayload, createSessionCookie } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

export async function loggued(email: string, password: string){
  await dbConnect();

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { 
      success: false,
      error: "Invalid username or password" 
    };
  }

  const session: SessionPayload = { 
    sub: String(user._id), 
    email: user.email, 
    name: user.userName 
  };

  await createSessionCookie(session);

  return {
    success: true,
    error: null
  }
}