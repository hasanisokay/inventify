import {
  dataUpdateResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { verifyToken } from "@/utils/verifyToken.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    const body = await req.json();
    const orgId = await getActiveOrg();
    const { username } = await verifyToken();
    const db = await dbConnect();

    if (body.items && Array.isArray(body.items)) {
      body.items = body.items.map(item => {
        if (item.itemId) {
          return { ...item, itemId: new ObjectId(item.itemId) }; 
        }
        return item;
      });
    }
    body.customerId = new ObjectId(body.customerId);
    
    const invoiceDate = body.invoiceDate;

    if (invoiceDate) {
      body.invoiceDate = new Date(invoiceDate);
    }
    const customerCollection = await db.collection("invoices");
    const result = await customerCollection.updateOne(
      { orgId: orgId, ownerUsername: username },
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
