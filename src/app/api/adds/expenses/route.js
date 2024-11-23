import {
  dataAddedResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();  // Expecting an array of expense objects
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of expenses." });
    }

    const db = await dbConnect();
    const customerCollection = await db.collection("expenses");

    // Map over the array and prepare the data for insertion
    const formData = body.map((item) => ({
      ...item,
      customerId: new ObjectId(item.customerId),
      date: new Date(item.date),
    }));

    // Perform the bulk insert using insertMany
    const result = await customerCollection.insertMany(formData);

    // If insertion was successful
    if (result.insertedCount > 0) {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json(serverErrorResponse);
  }
};
