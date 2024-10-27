import { serverErrorResponse } from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { verifyToken } from "@/utils/verifyToken.mjs";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const body = await req.json();
        const { username } = await verifyToken();
        const oldPassword = body.currentPassword;
        const newPassword = body.newPassword;

        const db = await dbConnect();
        const usersCollection = await db.collection("users");
        const user = await usersCollection.findOne(
            { username: username },
            { projection: { _id: 1, password: 1 } }
        );
        if (!user) {
            return NextResponse.json({ message: "User not found", status: 404 });
        }

        const passwordsMatch = await bcrypt.compare(oldPassword, user.password);

        if (!passwordsMatch) {
            return NextResponse.json({ message: "Wrong Old Password", status: 401  });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await usersCollection.updateOne(
            { username: username },
            { $set: { password: newHashedPassword } }
        );


        if (result.modifiedCount === 1) {
            return NextResponse.json({ message: "Password changed successfully.", status: 200  });
        } else {
            return NextResponse.json({ message: "Failed to change password.", status: 500  });
        }
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(serverErrorResponse);
    }
};
