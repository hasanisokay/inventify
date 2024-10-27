import {
  dataAddedResponse,
  dataUpdateResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { verifyToken } from "@/utils/verifyToken.mjs";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    const { username } = await verifyToken();
    const body = await req.json();
    const db = await dbConnect();
    body.createdTime = new Date();
    const customerCollection = await db.collection("users");
    const result = await customerCollection.updateOne({username:username},{$push:{organizations: body}})
    if (result.modifiedCount) {
      return NextResponse.json(dataUpdateResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
