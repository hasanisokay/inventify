import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Id required.", status: 404 });

    const db = await dbConnect();
    const userCollection = await db.collection("users");
    const res = await userCollection.findOne({
      "organizations.orgId": id,
    });

    if (!res) {
      return NextResponse.json({
        message: "orgId available",
        isAvailable: true,
      });
    } else {
      return NextResponse.json({
        message: "orgId not available",
        isAvailable: false,
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(serverErrorResponse);
  }
};
