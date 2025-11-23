import User from "@/models/User"
import Product from "@/models/Product"
import Order from "@/models/Order" // Import your Order model
import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { inngest } from "@/config/inngest"

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { address, items } = await request.json();

        if (!userId || !address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' });
        }

        // Calculate total amount
        const amounts = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (!product) throw new Error(`Product not found: ${item.product}`);
                return product.offerPrice * item.quantity;
            })
        );

        const totalAmount = amounts.reduce((acc, curr) => acc + curr, 0);
        const finalAmount = totalAmount + Math.floor(totalAmount * 0.02); // 2% fee

        // Create and save the order document
        const newOrder = new Order({
            userId,
            items,
            amount: finalAmount,
            address,
            status: 'Order Placed',
            date: new Date() // or Date.now() if schema uses timestamp
        });

        await newOrder.save();

        // Send order created event
        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: finalAmount,
                date: new Date()
            }
        });

        // Clear user cart
        const user = await User.findById(userId);
        if (user) {
            user.cartItems = []; // assuming cartItems is an array
            await user.save();
        }

        return NextResponse.json({ success: true, message: 'Order Placed' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}