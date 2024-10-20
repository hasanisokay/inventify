import {
    dataFoundResponse,
    noDataFoundResponse,
    serverErrorResponse,
  } from "@/constants/responses.mjs";
  import dbConnect from "@/services/dbConnect.mjs";
  import { NextResponse } from "next/server";
  
  export const GET = async (req) => {
    try {
      const db = await dbConnect();
      const itemsCollection = await db.collection("items");
      const categories = await itemsCollection.distinct("category");
      if (categories.length > 0) {
        return NextResponse.json(dataFoundResponse(categories));
      } else {
        return NextResponse.json(noDataFoundResponse);
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(serverErrorResponse);
    }
  };
  