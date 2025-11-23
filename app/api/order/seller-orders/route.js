import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" });
        }

        await connectDB();

        // Fetch orders (all for now — add filtering later)
        const orders = await Order.find({})
            .populate("address")
            .populate("items.product");

        return NextResponse.json({ success: true, orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
