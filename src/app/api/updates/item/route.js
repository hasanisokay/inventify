import {
    dataUpdateResponse,
    serverErrorResponse,
  } from "@/constants/responses.mjs";
  import dbConnect from "@/services/dbConnect.mjs";
  import { ObjectId } from "mongodb";
  import { NextResponse } from "next/server";
  
  export const PUT = async (req) => {
    try {
      const body = await req.json();
      const id = body.id;
      delete body.id;
      body.lastModifiedTime = new Date();
      const db = await dbConnect();
      const itemsCollection = await db.collection("items");
      const result = await itemsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: body }
      );
      
      if (result.modifiedCount > 0) {
        return NextResponse.json(dataUpdateResponse);
      } else {
        return NextResponse.json(serverErrorResponse);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      return NextResponse.json(serverErrorResponse);
    }
  };
  