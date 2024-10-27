import {
  dataDeletedResponse,
  dataDeleteErrorResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const DELETE = async (req) => {
  try {
      const body = await req.json();
      const invoiceNumber = body.invoiceNumber;
    const db = await dbConnect();
    const invoiceCollection = await db.collection("invoices");
    const res = await invoiceCollection.deleteOne({
      invoiceNumber:invoiceNumber
    });
    if (res.deletedCount > 0) {
      return NextResponse.json(dataDeletedResponse);
    } else {
      return NextResponse.json(dataDeleteErrorResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
