import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
    await dbConnect();
    const users = await User.find({});
    return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
    await dbConnect();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const user = await User.create({ name, email, password });

    return NextResponse.json(
        { id: user._id.toString(), name: user.name, email: user.email },
        { status: 201 },
    );
}