import {
  dataAddedResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const db = await dbConnect();
    if (!body.orgId || !body.ownerUsername)
      return NextResponse.json(unauthorizedResponse);

    const idFromClient = body.customerId;
    const idWithObject = new ObjectId(idFromClient);
    body.customerId = idWithObject;
    const invoiceDate = body.invoiceDate;

    if(invoiceDate){
      body.invoiceDate = new Date(invoiceDate);

    }
    if (body.items && Array.isArray(body.items)) {
      body.items = body.items.map(item => {
        if (item.itemId) {
          return { ...item, itemId: new ObjectId(item.itemId) }; 
        }
        return item;
      });
    }

    const customerCollection = await db.collection("invoices");
    const result = await customerCollection.insertOne(body);
    if (result.insertedId) {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
