import dbConnect from "@/services/dbConnect.mjs"; // Adjust the import based on your project structure
import getActiveOrg from "@/utils/getActiveOrg.mjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const orgId = await getActiveOrg();
    const searchParams = req.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json({ error: "Invalid date format." });
    }

    const db = await dbConnect();

    // Fetch data from invoices with aggregation
    const invoiceCollection = await db.collection("invoices");
    const invoiceResults = await invoiceCollection
      .aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startDate,
              $lte: endDate,
            },
            orgId: orgId,
          },
        },
        {
          $group: {
            _id: null,
            totalDue: { $sum: "$dueAmount" },
            totalPaid: { $sum: "$paidAmount" },
          },
        },
      ])
      .toArray();

    // Fetch total expenses using aggregation
    const expenseCollection = await db.collection("expenses");
    const expenseResults = await expenseCollection
      .aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
            orgId: orgId,
          },
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$total" },
          },
        },
      ])
      .toArray();


    const response = {
      success: true,
      totalDue: invoiceResults.length > 0 ? invoiceResults[0].totalDue : 0,
      totalPaid: invoiceResults.length > 0 ? invoiceResults[0].totalPaid : 0,
      totalExpenses: expenseResults.length > 0 ? expenseResults[0].totalExpenses : 0,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error fetching cost summary:", error);
    return NextResponse.json({ success: false, message: "Server error." });
  }
};
