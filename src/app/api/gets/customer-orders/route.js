import {
  dataFoundResponse,
  noDataFoundResponse,
  serverErrorResponse,
} from "@/constants/responses.mjs";
import dbConnect from "@/services/dbConnect.mjs";
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const activeOrgId = await getActiveOrg();
    const searchParams = req.nextUrl.searchParams;
    const customerId = searchParams.get("id");
    const sortOrder = parseInt(searchParams.get("sortOrder")) || -1;
    const db = await dbConnect();
    const invoiceCollection = await db.collection("invoices");
    const res = await invoiceCollection
      .find({
        customerId: new ObjectId(customerId),
        orgId: activeOrgId,
      })
      .sort({ invoiceDate: sortOrder })
      .toArray();

    if (res?.length > 0) {
      return NextResponse.json(dataFoundResponse(res));
    } else {
      return NextResponse.json(noDataFoundResponse);
    }
  } catch {
    return NextResponse.json(serverErrorResponse);
  }
};
