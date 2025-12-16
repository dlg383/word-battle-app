import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } },
) {
    await dbConnect();

    const { id } = await params;

    if (!isValidObjectId(id)) {
        return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const user = await User.findById(id).select("name email");

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email });
}
