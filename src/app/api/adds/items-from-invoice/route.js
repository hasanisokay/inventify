import {
    dataAddedResponse,
    serverErrorResponse,
  } from "@/constants/responses.mjs";
  import dbConnect from "@/services/dbConnect.mjs";
  import { NextResponse } from "next/server";
  
  export const POST = async (req) => {
    try {
      const body = await req.json();
      const items = body?.items;
  
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({
          status: 400,
          message: "No items provided.",
        });
      }
      const db = await dbConnect();
      const itemCollection = await db.collection("items");
      const enrichedItems = items.map(({ tax, quantity, ...rest }) => ({
        ...rest,
        createdTime: new Date(),
        lastModifiedTime: new Date(),
      }));
  

      const result = await itemCollection.insertMany(enrichedItems);
  
      if (result.insertedCount > 0) {

        const insertedItems = enrichedItems.map((item, index) => ({
          ...item,
          _id: result.insertedIds[index],
        }));

  
        return NextResponse.json({
          status: 201,
          message: "Items added successfully.",
          savedItems: insertedItems,
        });
      } else {
        return NextResponse.json(serverErrorResponse);
      }
    } catch (error) {
      console.error("Error adding items from invoice:", error);
      return NextResponse.json(serverErrorResponse);
    }
  };
  