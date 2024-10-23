import {
  dataAddedResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const db = await dbConnect();
    body.createdTime= new Date()
    body.lastModifiedTime= new Date()
    const returnId = body.returnId;
    if(returnId){
      delete body.returnId;
    }
    
    const customerCollection = await db.collection("customers");
    const result = await customerCollection.insertOne(body);
    if (result.insertedId) {
      const response = { ...dataAddedResponse, _id: result.insertedId };
      if (returnId) {
        return NextResponse.json(response);
      } else {
        return NextResponse.json(dataAddedResponse);
      }
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
