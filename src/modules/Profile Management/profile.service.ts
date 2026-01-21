import { NextFunction, Request, Response } from "express";
import {
  updateProfileDTO,
  addStoreAddressDTO,
  updateStoreAddressDTO,
} from "./profile.dto";
import { template } from "../../utils/sendEmail/generateHTML";
import { createJwt } from "../../utils/jwt";
import { createOtp } from "../../utils/createOtp";
import { compare, hash } from "../../utils/bcrypt";
import { sendEmail } from "../../utils/sendEmail/send.email";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";
import { IProfileServcie } from "../../types/global.interfaces";
import { AppError } from "../../core/errors/app.error";
import { responseHandler } from "../../core/handlers/response.handler";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { prisma } from "../../DB/lib/prisma";
import { Prisma } from "@prisma/client";
import { GenderEnum } from "../../types/global.types";
import uploadImage from "../../utils/uploadImage";
export class ProfileService implements IProfileServcie {
  constructor() {}

  // ============================ getProfile ============================
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    return responseHandler({
      res,
      message: "User profile returned successfully",
      data: { user },
    });
  };

  // ============================ updateProfile ============================
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const {
      full_name,
      phone,
      lang,
      birth_date,
      gender,
      synonyms,
      apple_id,
    }: updateProfileDTO = req.body;
    // step: upload image if exists
    let image_url: string | undefined;
    if (req.file) {
      image_url = await uploadImage(req.file as any, "users");
    }
    // step: update user data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        full_name: full_name ?? user.full_name,
        phone: phone ?? user.phone,
        lang: lang ?? user.lang,
        birth_date: birth_date ? new Date(birth_date) : user.birth_date,
        gender: gender ?? user.gender,
        apple_id: apple_id ?? user.apple_id,
        image_url: image_url ?? user.image_url,
      },
    });
    // step: update supplier data if synonyms provided
    if (synonyms !== undefined) {
      await prisma.supplier.update({
        where: { id: user.id },
        data: { synonyms },
      });
    }
    return responseHandler({
      res,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  };

  // ============================ updateDocuments ============================
  updateDocuments = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const {
      type_id,
      is_active,
      national_id,
      tax_card,
      commercial_register,
    }: any = req.body;

    const pendingUpdates: any = {};
    if (type_id !== undefined) pendingUpdates.type_id = type_id;
    if (is_active !== undefined) pendingUpdates.is_active = is_active;
    if (national_id !== undefined) pendingUpdates.national_id = national_id;
    if (tax_card !== undefined) pendingUpdates.tax_card = tax_card;
    if (commercial_register !== undefined)
      pendingUpdates.commercial_register = commercial_register;

    if (Object.keys(pendingUpdates).length > 0) {
      await prisma.profileUpdateRequest.create({
        data: {
          user_id: user.id,
          data: pendingUpdates,
          status: "PENDING",
        },
      });
      return responseHandler({
        res,
        message: "Documents submission successful. Pending admin approval.",
      });
    }

    return responseHandler({
      res,
      message: "No document changes provided.",
    });
  };

  // ============================ getStoreAddresses ============================
  getStoreAddresses = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const user = res.locals.user;
    // step: get all store addresses for this supplier
    const storeAddresses = await prisma.supplierStoreAddress.findMany({
      where: {
        supplier_id: user.id,
      },
      orderBy: { created_at: "desc" },
    });
    return responseHandler({
      res,
      message: "Store addresses returned successfully",
      data: { storeAddresses },
    });
  };

  // ============================ addStoreAddress ============================
  addStoreAddress = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const {
      address_line_1,
      address_line_2,
      city,
      state,
      country,
      latitude,
      longitude,
      contact_name,
      contact_phone,
      google_map_link,
      working_hours,
    }: addStoreAddressDTO = req.body;

    // step: create new store address
    const storeAddress = await prisma.supplierStoreAddress.create({
      data: {
        supplier_id: user.id,
        address_line_1: address_line_1 ?? null,
        address_line_2: address_line_2 ?? null,
        city: city ?? null,
        state: state ?? null,
        country: country ?? "Egypt",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        contact_name: contact_name ?? null,
        contact_phone: contact_phone ?? null,
        google_map_link: google_map_link ?? null,
        working_hours: working_hours
          ? (working_hours as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
    return responseHandler({
      res,
      message: "Store address added successfully",
      data: { storeAddress },
      status: 201,
    });
  };

  // ============================ getStoreAddress ============================
  getStoreAddress = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { id } = req.params;
    // step: get store address
    const storeAddress = await prisma.supplierStoreAddress.findFirst({
      where: {
        id: String(id),
        supplier_id: user.id,
      },
    });
    if (!storeAddress) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Store address not found");
    }
    return responseHandler({
      res,
      message: "Store address returned successfully",
      data: { storeAddress },
    });
  };

  // ============================ updateStoreAddress ============================
  updateStoreAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const user = res.locals.user;
    const { id } = req.params;
    const {
      address_line_1,
      address_line_2,
      city,
      state,
      country,
      latitude,
      longitude,
      contact_name,
      contact_phone,
      google_map_link,
      working_hours,
    }: updateStoreAddressDTO = req.body;
    // step: check if store address exists and belongs to this supplier
    const existingAddress = await prisma.supplierStoreAddress.findFirst({
      where: {
        id: String(id),
        supplier_id: user.id,
      },
    });
    if (!existingAddress) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Store address not found");
    }
    // step: update store address
    const updatedAddress = await prisma.supplierStoreAddress.update({
      where: { id: String(id) },
      data: {
        address_line_1: address_line_1 ?? existingAddress.address_line_1,
        address_line_2: address_line_2 ?? existingAddress.address_line_2,
        city: city ?? existingAddress.city,
        state: state ?? existingAddress.state,
        country: country ?? existingAddress.country,
        latitude: latitude ?? existingAddress.latitude,
        longitude: longitude ?? existingAddress.longitude,
        contact_name: contact_name ?? existingAddress.contact_name,
        contact_phone: contact_phone ?? existingAddress.contact_phone,
        google_map_link: google_map_link ?? existingAddress.google_map_link,
        working_hours: working_hours
          ? (working_hours as Prisma.InputJsonValue)
          : ((existingAddress.working_hours as Prisma.InputJsonValue) ??
            Prisma.JsonNull),
      },
    });
    return responseHandler({
      res,
      message: "Store address updated successfully",
      data: { storeAddress: updatedAddress },
    });
  };

  // ============================ deleteStoreAddress ============================
  deleteStoreAddress = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const user = res.locals.user;
    const { id } = req.params;

    // step: check if store address exists and belongs to this supplier
    const existingAddress = await prisma.supplierStoreAddress.findFirst({
      where: {
        id: String(id),
        supplier_id: user.id,
      },
    });
    if (!existingAddress) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "Store address not found");
    }
    // step: hard delete store address
    await prisma.supplierStoreAddress.delete({
      where: { id: String(id) },
    });
    return responseHandler({
      res,
      message: "Store address deleted successfully",
    });
  };

  // ============================ updateStat ============================
  updateStat = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    // step: get all products for this supplier
    const supplierProducts = await prisma.product.findMany({
      where: { supplier_id: user.id },
      select: {
        id: true,
        name: true,
        is_active: true,
        category_id: true,
        brand_id: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    });
    const productIds = supplierProducts.map((p) => p.id);

    // step: get all order items for this supplier's products
    const orderItems = await prisma.order_items.findMany({
      where: { productId: { in: productIds } },
      select: {
        orderId: true,
        productId: true,
        quantity: true,
        price: true,
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            customerId: true,
            user: { select: { full_name: true } },
          },
        },
      },
    });

    // step: calculate total_customers (unique customers who ordered)
    const uniqueCustomerIds = new Set<string>();
    orderItems.forEach((item) => {
      if (item.orders?.customerId) {
        uniqueCustomerIds.add(item.orders.customerId);
      }
    });
    const total_customers = uniqueCustomerIds.size;

    // step: calculate total_orders (unique orders containing this supplier's products)
    const uniqueOrderIds = new Set<number>();
    orderItems.forEach((item) => {
      if (item.orderId) {
        uniqueOrderIds.add(item.orderId);
      }
    });
    const total_orders = uniqueOrderIds.size;

    // step: calculate total_delivered_orders
    const deliveredOrderIds = new Set<number>();
    orderItems.forEach((item) => {
      if (item.orders?.status === "DELIVERED" && item.orderId) {
        deliveredOrderIds.add(item.orderId);
      }
    });
    const total_delivered_orders = deliveredOrderIds.size;

    // step: calculate total_cancelled_orders
    const cancelledOrderIds = new Set<number>();
    orderItems.forEach((item) => {
      if (item.orders?.status === "CANCELLED" && item.orderId) {
        cancelledOrderIds.add(item.orderId);
      }
    });
    const total_cancelled_orders = cancelledOrderIds.size;

    // step: calculate total_active_products
    const total_active_products = supplierProducts.filter(
      (p) => p.is_active,
    ).length;

    // step: calculate last_order_date
    let last_order_date: Date | null = null;
    orderItems.forEach((item) => {
      if (item.orders?.createdAt) {
        if (!last_order_date || item.orders.createdAt > last_order_date) {
          last_order_date = item.orders.createdAt;
        }
      }
    });

    // step: calculate category_stat
    const categoryMap = new Map<string, number>();
    supplierProducts.forEach((product) => {
      const categoryName = product.category?.name || "Uncategorized";
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });
    const category_stat = Array.from(categoryMap.entries()).map(
      ([category_name, total_products]) => ({
        category_name,
        total_products,
      }),
    );

    // step: calculate brand_stat
    const brandMap = new Map<string, number>();
    supplierProducts.forEach((product) => {
      const brandName = product.brand?.name || "No Brand";
      brandMap.set(brandName, (brandMap.get(brandName) || 0) + 1);
    });
    const brand_stat = Array.from(brandMap.entries()).map(
      ([brand_name, total_products]) => ({
        brand_name,
        total_products,
      }),
    );

    // step: calculate total_products_rating
    const productReviews = await prisma.reviews.findMany({
      where: {
        productId: { in: productIds },
        status: "APPROVED",
        // rating: { not: undefined }, // Removed invalid filter, rating is non-nullable Float
      },
      select: {
        productId: true,
        rating: true,
      },
    });
    const ratingMap = new Map<string, { sum: number; count: number }>();
    productReviews.forEach((review) => {
      if (review.productId) {
        const current = ratingMap.get(review.productId) || { sum: 0, count: 0 };
        current.sum += review.rating;
        current.count += 1;
        ratingMap.set(review.productId, current);
      }
    });
    const total_products_rating = supplierProducts
      .filter((p) => ratingMap.has(p.id))
      .map((product) => {
        const ratingData = ratingMap.get(product.id)!;
        return {
          product_name: product.name,
          total_rating: Number((ratingData.sum / ratingData.count).toFixed(1)),
        };
      });

    // step: calculate sales_history
    const salesMap = new Map<
      string,
      {
        product_name: string;
        total_ordered_amount: number;
        total_ordered_price: number;
        all_customers: Set<string>;
      }
    >();
    orderItems.forEach((item) => {
      if (item.productId) {
        const productName =
          supplierProducts.find((p) => p.id === item.productId)?.name ||
          "Unknown";
        const current = salesMap.get(item.productId) || {
          product_name: productName,
          total_ordered_amount: 0,
          total_ordered_price: 0,
          all_customers: new Set<string>(),
        };
        current.total_ordered_amount += Number(item.quantity || 0);
        current.total_ordered_price += Number(item.price * item.quantity || 0);
        if (item.orders?.user?.full_name) {
          current.all_customers.add(item.orders.user.full_name);
        }
        salesMap.set(item.productId, current);
      }
    });
    const sales_history = Array.from(salesMap.values()).map((sale) => ({
      product_name: sale.product_name,
      total_ordered_amount: sale.total_ordered_amount,
      total_ordered_price: sale.total_ordered_price,
      all_customers: Array.from(sale.all_customers),
    }));

    // step: upsert SupplierStat table
    await prisma.supplierStat.upsert({
      where: { supplier_id: user.id },
      update: {
        total_customers,
        total_orders,
        total_delivered_orders,
        total_cancelled_orders,
        total_active_products,
        last_order_date,
        category_stat: category_stat as Prisma.InputJsonValue,
        brand_stat: brand_stat as Prisma.InputJsonValue,
        total_products_rating: total_products_rating as Prisma.InputJsonValue,
        sales_history: sales_history as Prisma.InputJsonValue,
      },
      create: {
        supplier_id: user.id,
        total_customers,
        total_orders,
        total_delivered_orders,
        total_cancelled_orders,
        total_active_products,
        last_order_date,
        category_stat: category_stat as Prisma.InputJsonValue,
        brand_stat: brand_stat as Prisma.InputJsonValue,
        total_products_rating: total_products_rating as Prisma.InputJsonValue,
        sales_history: sales_history as Prisma.InputJsonValue,
      },
    });

    return responseHandler({
      res,
      message: "Stats updated successfully",
      data: {
        total_customers,
        total_orders,
        total_delivered_orders,
        total_cancelled_orders,
        total_active_products,
        last_order_date,
        category_stat,
        brand_stat,
        total_products_rating,
        sales_history,
      },
    });
  };

  // ============================ getStat ============================
  getStat = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { isAdvancedStat } = req.query;

    // step: get stats from SupplierStat table
    const stats = await prisma.supplierStat.findUnique({
      where: { supplier_id: user.id },
    });

    if (!stats) {
      throw new AppError(
        HttpStatusCode.NOT_FOUND,
        "Stats not found. Please update stats first.",
      );
    }

    // step: if isAdvancedStat is false, exclude sales_history
    if (isAdvancedStat === "true") {
      return responseHandler({
        res,
        message: "Stats returned successfully",
        data: { stats },
      });
    }

    // step: return stats without sales_history
    const { sales_history, ...basicStats } = stats;
    return responseHandler({
      res,
      message: "Stats returned successfully",
      data: { stats: basicStats },
    });
  };

  // ============================ softDelete ============================
  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    // step: check if user is already soft deleted
    if (user.deleted_at) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Account is already marked for deletion",
      );
    }
    // step: check delete validation (no product in active orders)
    const activeOrderItems = await prisma.order_items.findFirst({
      where: {
        product: { supplier_id: user.id },
        orders: {
          status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
        },
      },
    });
    if (activeOrderItems) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Cannot delete account. You have products in active orders.",
      );
    }
    // step: check delete validation (no product in carts)
    const activeCartItems = await prisma.cartItem.findFirst({
      where: {
        product: { supplier_id: user.id },
      },
    });
    if (activeCartItems) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Cannot delete account. You have products in customer carts.",
      );
    }
    // step: soft delete user by setting deleted_at
    await prisma.user.update({
      where: { id: user.id },
      data: { deleted_at: new Date() },
    });

    return responseHandler({
      res,
      message: "Account marked for deletion successfully",
    });
  };

  // ============================ hardDelete ============================
  hardDelete = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    // step: check delete validation (no product in active orders)
    const activeOrderItems = await prisma.order_items.findFirst({
      where: {
        product: { supplier_id: user.id },
        orders: {
          status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
        },
      },
    });
    if (activeOrderItems) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Cannot delete account. You have products in active orders.",
      );
    }
    // step: check delete validation (no product in carts)
    const activeCartItems = await prisma.cartItem.findFirst({
      where: {
        product: { supplier_id: user.id },
      },
    });
    if (activeCartItems) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Cannot delete account. You have products in customer carts.",
      );
    }
    // step: delete supplier related data first (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete supplier stat
      await tx.supplierStat.deleteMany({ where: { supplier_id: user.id } });
      // Delete store addresses
      await tx.supplierStoreAddress.deleteMany({
        where: { supplier_id: user.id },
      });
      // Delete profile update requests
      await tx.profileUpdateRequest.deleteMany({ where: { user_id: user.id } });
      // Delete user verify records
      await tx.userVerify.deleteMany({ where: { user_id: user.id } });
      // Delete supplier record
      await tx.supplier.delete({ where: { id: user.id } });
      // Delete user record
      await tx.user.delete({ where: { id: user.id } });
    });

    return responseHandler({
      res,
      message: "Account deleted permanently",
    });
  };

  // ============================ cancelSoftDelete ============================
  cancelSoftDelete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const user = res.locals.user;
    // step: check if user is soft deleted
    if (!user.deleted_at) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Account is not marked for deletion",
      );
    }

    // step: cancel soft delete by clearing deleted_at
    await prisma.user.update({
      where: { id: user.id },
      data: { deleted_at: null },
    });
    return responseHandler({
      res,
      message: "Account deletion cancelled successfully",
    });
  };
}
