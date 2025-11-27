import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb/connection";
import {
  InventoryItem,
  Order,
  FinishedGoods,
  OrderStatus,
} from "@/lib/mongodb/models";
import { authenticate, AuthenticatedRequest } from "@/lib/auth/middleware";

async function getHandler(req: AuthenticatedRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly

    // Get date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "weekly":
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    // Low stock items
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ["$currentStock", "$thresholdValue"] },
    }).select("name currentStock thresholdValue unit");

    // Total inventory items
    const totalInventoryItems = await InventoryItem.countDocuments();

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate("items.recipe", "name")
      .populate("createdBy", "name")
      .sort({ orderDate: -1 })
      .limit(10)
      .select("orderNumber customer status orderDate deliveryDate");

    // Orders in period
    const ordersInPeriod = await Order.countDocuments({
      orderDate: { $gte: startDate, $lte: now },
    });

    // Completed orders in period
    const completedOrdersInPeriod = await Order.countDocuments({
      orderDate: { $gte: startDate, $lte: now },
      status: OrderStatus.DELIVERED,
    });

    // Total finished goods items
    const totalFinishedGoods = await FinishedGoods.countDocuments();

    // Finished goods stock summary
    const finishedGoodsStock = await FinishedGoods.find()
      .select("name currentStock unit lastProducedDate")
      .sort({ name: 1 });

    // Daily sales trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo, $lte: now },
          status: { $in: [OrderStatus.DELIVERED, OrderStatus.DISPATCHED] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
          },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$itemsTotal", 0] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Purchase history for inventory (last 30 days)
    const purchaseHistory = await InventoryItem.aggregate([
      { $unwind: "$purchaseHistory" },
      {
        $match: {
          "purchaseHistory.date": { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$purchaseHistory.date",
            },
          },
          quantity: { $sum: "$purchaseHistory.quantity" },
          cost: { $sum: "$purchaseHistory.cost" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales by recipe
    const salesByRecipe = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo, $lte: now },
          status: { $in: [OrderStatus.DELIVERED, OrderStatus.DISPATCHED] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.recipe",
          count: { $sum: "$items.quantity" },
          revenue: { $sum: { $ifNull: ["$items.lineTotal", 0] } },
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      {
        $project: {
          recipe: "$recipe.name",
          count: 1,
          revenue: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Order trends
    const orderTrends = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Orders by recipe breakdown
    const ordersByRecipe = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.recipe",
          count: { $sum: "$items.quantity" },
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      {
        $project: {
          recipe: "$recipe.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recipe performance data
    const recipePerformance = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thirtyDaysAgo, $lte: now },
          status: { $in: [OrderStatus.DELIVERED, OrderStatus.DISPATCHED] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.recipe",
          orders: { $sum: "$items.quantity" },
          revenue: { $sum: { $ifNull: ["$items.lineTotal", 0] } },
        },
      },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      {
        $project: {
          name: "$recipe.name",
          orders: 1,
          revenue: 1,
        },
      },
      { $sort: { orders: -1 } },
    ]);

    return NextResponse.json({
      inventory: {
        total: totalInventoryItems,
        lowStock: lowStockItems.length,
        lowStockItems,
        purchaseHistory: purchaseHistory.map((p) => ({
          date: p._id,
          quantity: p.quantity,
          cost: p.cost,
        })),
      },
      orders: {
        total: ordersByStatus.reduce((sum, item) => sum + item.count, 0),
        byStatus: ordersByStatus,
        inPeriod: ordersInPeriod,
        completedInPeriod: completedOrdersInPeriod,
        recent: recentOrders,
        trends: orderTrends.map((t) => ({
          date: t._id,
          count: t.count,
        })),
        byRecipe: ordersByRecipe.map((o) => ({
          recipe: o.recipe,
          count: o.count,
        })),
      },
      finishedGoods: {
        total: totalFinishedGoods,
        stock: finishedGoodsStock,
      },
      trends: {
        sales: salesTrend,
        salesByRecipe: salesByRecipe.map((s) => ({
          recipe: s.recipe,
          count: s.count,
          revenue: s.revenue,
        })),
      },
      recipes: {
        performance: recipePerformance,
      },
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats", details: error.message },
      { status: 500 }
    );
  }
}

export const GET = authenticate(getHandler);
