import {
  dataUpdateResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    const body = await req.json();
    const invoiceNumber = body.invoiceNumber;
    const newPaidAmount = body.newPaidAmount;
    const paymentMethod = body.paymentMethod || "";
    const paymentFromNumber = body.paymentFromNumber || "";
    const trxId = body.trxId || "";
    const dueAmount = body.newDueAmount || 0;
    const resetData = {
      paidAmount: newPaidAmount,
      paymentMethod,
      paymentFromNumber,
      trxId,
      dueAmount,
    };
    const db = await dbConnect();
    const customerCollection = await db.collection("invoices");
    const result = await customerCollection.updateOne(
      { invoiceNumber: invoiceNumber },
      { $set: resetData }
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
