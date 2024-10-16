import { dataFoundResponse, noDataFoundResponse, serverErrorResponse } from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");

    const db = await dbConnect();
    const userCollection = await db.collection("users");
    const result = await userCollection.findOne(
      { username: username },
      { projection: { organizations: 1, _id: 1 } }
    );
    if(result?.organizations?.length>0){
        return NextResponse.json(dataFoundResponse(result?.organizations))
    }
    return NextResponse.json(noDataFoundResponse)
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
