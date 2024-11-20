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
      const ids = body.ids; 
      const status = body.status; 
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({
          message: "No valid IDs provided for marking as inactive.",
          status: 400,
        });
      }
  
      const db = await dbConnect();
      const customerCollection = await db.collection("items");
      const objectIds = ids.map((id) => new ObjectId(id));

      const res = await customerCollection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: status } }
      );
  
      if (res.modifiedCount > 0) {
        return NextResponse.json(dataUpdateResponse); 
      } else {
        return NextResponse.json(serverErrorResponse); 
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(serverErrorResponse); 
    }
  };
  