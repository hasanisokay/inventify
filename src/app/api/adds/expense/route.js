import {
  dataAddedResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const db = await dbConnect();
    const customerCollection = await db.collection("expenses");
    const formData = {
      ...body,
      customerId: new ObjectId(body.customerId),
      date: new Date(body.date)
    };
    const result = await customerCollection.insertOne(formData);
    
    if (result.insertedId) {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(serverErrorResponse);
  }
};
