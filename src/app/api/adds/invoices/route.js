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

    const processedInvoices = body.map((invoice) => {

      const customerId = invoice.customerId ? new ObjectId(invoice.customerId) : null;

      const items = invoice.items.map((item) => ({
        ...item,
        itemId: item.itemId ? new ObjectId(item.itemId) : null,
      }));

      const invoiceDate = invoice.invoiceDate ? new Date(invoice.invoiceDate) : null;

      return {
        ...invoice,
        customerId, 
        items, 
        invoiceDate, 
      };
    });

    const customerCollection = await db.collection("invoices");
    const result = await customerCollection.insertMany(processedInvoices);
    if (result.insertedCount > 0)  {
      return NextResponse.json(dataAddedResponse);
    } else {
      return NextResponse.json(serverErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
