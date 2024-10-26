import dbConnect from "@/services/dbConnect.mjs"; // Adjust the import based on your project structure
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (req) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json({ error: "Invalid date format." });
    }

    const db = await dbConnect();
    const invoiceCollection = await db.collection("invoices");
    const results = await invoiceCollection
      .aggregate([
        {
          $match: {
            invoiceDate: {
              $gte: startDate,
              $lte: endDate,
            },
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

    if (results.length > 0) {
      return NextResponse.json({
        success: true,
        totalDue: results[0].totalDue,
        totalPaid: results[0].totalPaid,
      });
    } else {
      return NextResponse.json({ success: false, message: "No data found." });
    }
  } catch (error) {
    console.error("Error fetching cost summary:", error);
    return NextResponse.json({ success: false, message: "Server error." });
  }
};
