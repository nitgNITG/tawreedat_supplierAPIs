"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const app_error_1 = require("../../core/errors/app.error");
const response_handler_1 = require("../../core/handlers/response.handler");
const http_status_code_1 = require("../../core/http/http.status.code");
const prisma_1 = require("../../DB/lib/prisma");
const client_1 = require("@prisma/client");
const uploadImage_1 = __importDefault(require("../../utils/uploadImage"));
class ProfileService {
    constructor() { }
    // ============================ getProfile ============================
    getProfile = async (req, res, next) => {
        const user = res.locals.user;
        return (0, response_handler_1.responseHandler)({
            res,
            message: "User profile returned successfully",
            data: { user },
        });
    };
    // ============================ updateProfile ============================
    updateProfile = async (req, res, next) => {
        const user = res.locals.user;
        const { full_name, phone, lang, birth_date, gender, synonyms, apple_id, } = req.body;
        // step: upload image if exists
        let image_url;
        if (req.file) {
            image_url = await (0, uploadImage_1.default)(req.file, "users");
        }
        // step: update user data
        const updatedUser = await prisma_1.prisma.user.update({
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
            await prisma_1.prisma.supplier.update({
                where: { id: user.id },
                data: { synonyms },
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Profile updated successfully",
            data: { user: updatedUser },
        });
    };
    // ============================ updateDocuments ============================
    updateDocuments = async (req, res, next) => {
        const user = res.locals.user;
        const { type_id, is_active, national_id, tax_card, commercial_register, } = req.body;
        const pendingUpdates = {};
        if (type_id !== undefined)
            pendingUpdates.type_id = type_id;
        if (is_active !== undefined)
            pendingUpdates.is_active = is_active;
        if (national_id !== undefined)
            pendingUpdates.national_id = national_id;
        if (tax_card !== undefined)
            pendingUpdates.tax_card = tax_card;
        if (commercial_register !== undefined)
            pendingUpdates.commercial_register = commercial_register;
        if (Object.keys(pendingUpdates).length > 0) {
            await prisma_1.prisma.profileUpdateRequest.create({
                data: {
                    user_id: user.id,
                    data: pendingUpdates,
                    status: "PENDING",
                },
            });
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Documents submission successful. Pending admin approval.",
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "No document changes provided.",
        });
    };
    // ============================ getStoreAddresses ============================
    getStoreAddresses = async (req, res, next) => {
        const user = res.locals.user;
        // step: get all store addresses for this supplier
        const storeAddresses = await prisma_1.prisma.supplierStoreAddress.findMany({
            where: {
                supplier_id: user.id,
            },
            orderBy: { created_at: "desc" },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Store addresses returned successfully",
            data: { storeAddresses },
        });
    };
    // ============================ addStoreAddress ============================
    addStoreAddress = async (req, res, next) => {
        const user = res.locals.user;
        const { address_line_1, address_line_2, city, state, country, postal_code, latitude, longitude, contact_name, contact_phone, working_hours, } = req.body;
        // step: create new store address
        const storeAddress = await prisma_1.prisma.supplierStoreAddress.create({
            data: {
                supplier_id: user.id,
                address_line_1: address_line_1 ?? null,
                address_line_2: address_line_2 ?? null,
                city: city ?? null,
                state: state ?? null,
                country: country ?? "Egypt",
                postal_code: postal_code ?? null,
                latitude: latitude ?? null,
                longitude: longitude ?? null,
                contact_name: contact_name ?? null,
                contact_phone: contact_phone ?? null,
                working_hours: working_hours
                    ? working_hours
                    : client_1.Prisma.JsonNull,
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Store address added successfully",
            data: { storeAddress },
            status: 201,
        });
    };
    // ============================ getStoreAddress ============================
    getStoreAddress = async (req, res, next) => {
        const user = res.locals.user;
        const { id } = req.params;
        // step: get store address
        const storeAddress = await prisma_1.prisma.supplierStoreAddress.findFirst({
            where: {
                id: String(id),
                supplier_id: user.id,
            },
        });
        if (!storeAddress) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Store address not found");
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Store address returned successfully",
            data: { storeAddress },
        });
    };
    // ============================ updateStoreAddress ============================
    updateStoreAddress = async (req, res, next) => {
        const user = res.locals.user;
        const { id } = req.params;
        const { address_line_1, address_line_2, city, state, country, postal_code, latitude, longitude, contact_name, contact_phone, working_hours, } = req.body;
        // step: check if store address exists and belongs to this supplier
        const existingAddress = await prisma_1.prisma.supplierStoreAddress.findFirst({
            where: {
                id: String(id),
                supplier_id: user.id,
            },
        });
        if (!existingAddress) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Store address not found");
        }
        // step: update store address
        const updatedAddress = await prisma_1.prisma.supplierStoreAddress.update({
            where: { id: String(id) },
            data: {
                address_line_1: address_line_1 ?? existingAddress.address_line_1,
                address_line_2: address_line_2 ?? existingAddress.address_line_2,
                city: city ?? existingAddress.city,
                state: state ?? existingAddress.state,
                country: country ?? existingAddress.country,
                postal_code: postal_code ?? existingAddress.postal_code,
                latitude: latitude ?? existingAddress.latitude,
                longitude: longitude ?? existingAddress.longitude,
                contact_name: contact_name ?? existingAddress.contact_name,
                contact_phone: contact_phone ?? existingAddress.contact_phone,
                working_hours: working_hours
                    ? working_hours
                    : (existingAddress.working_hours ??
                        client_1.Prisma.JsonNull),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Store address updated successfully",
            data: { storeAddress: updatedAddress },
        });
    };
    // ============================ deleteStoreAddress ============================
    deleteStoreAddress = async (req, res, next) => {
        const user = res.locals.user;
        const { id } = req.params;
        // step: check if store address exists and belongs to this supplier
        const existingAddress = await prisma_1.prisma.supplierStoreAddress.findFirst({
            where: {
                id: String(id),
                supplier_id: user.id,
            },
        });
        if (!existingAddress) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Store address not found");
        }
        // step: hard delete store address
        await prisma_1.prisma.supplierStoreAddress.delete({
            where: { id: String(id) },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Store address deleted successfully",
        });
    };
    // ============================ updateStat ============================
    updateStat = async (req, res, next) => {
        const user = res.locals.user;
        // step: get all products for this supplier
        const supplierProducts = await prisma_1.prisma.product.findMany({
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
        const orderItems = await prisma_1.prisma.orderItem.findMany({
            where: { product_id: { in: productIds } },
            select: {
                order_id: true,
                product_id: true,
                amount: true,
                total_price: true,
                snapshot_product_name: true,
                order: {
                    select: {
                        id: true,
                        status: true,
                        created_at: true,
                        userId: true,
                        User: { select: { full_name: true } },
                    },
                },
            },
        });
        // step: calculate total_customers (unique customers who ordered)
        const uniqueCustomerIds = new Set();
        orderItems.forEach((item) => {
            if (item.order?.userId) {
                uniqueCustomerIds.add(item.order.userId);
            }
        });
        const total_customers = uniqueCustomerIds.size;
        // step: calculate total_orders (unique orders containing this supplier's products)
        const uniqueOrderIds = new Set();
        orderItems.forEach((item) => {
            if (item.order_id) {
                uniqueOrderIds.add(item.order_id);
            }
        });
        const total_orders = uniqueOrderIds.size;
        // step: calculate total_delivered_orders
        const deliveredOrderIds = new Set();
        orderItems.forEach((item) => {
            if (item.order?.status === "DELIVERED" && item.order_id) {
                deliveredOrderIds.add(item.order_id);
            }
        });
        const total_delivered_orders = deliveredOrderIds.size;
        // step: calculate total_cancelled_orders
        const cancelledOrderIds = new Set();
        orderItems.forEach((item) => {
            if (item.order?.status === "CANCELLED" && item.order_id) {
                cancelledOrderIds.add(item.order_id);
            }
        });
        const total_cancelled_orders = cancelledOrderIds.size;
        // step: calculate total_active_products
        const total_active_products = supplierProducts.filter((p) => p.is_active).length;
        // step: calculate last_order_date
        let last_order_date = null;
        orderItems.forEach((item) => {
            if (item.order?.created_at) {
                if (!last_order_date || item.order.created_at > last_order_date) {
                    last_order_date = item.order.created_at;
                }
            }
        });
        // step: calculate category_stat
        const categoryMap = new Map();
        supplierProducts.forEach((product) => {
            const categoryName = product.category?.name || "Uncategorized";
            categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
        });
        const category_stat = Array.from(categoryMap.entries()).map(([category_name, total_products]) => ({
            category_name,
            total_products,
        }));
        // step: calculate brand_stat
        const brandMap = new Map();
        supplierProducts.forEach((product) => {
            const brandName = product.brand?.name || "No Brand";
            brandMap.set(brandName, (brandMap.get(brandName) || 0) + 1);
        });
        const brand_stat = Array.from(brandMap.entries()).map(([brand_name, total_products]) => ({
            brand_name,
            total_products,
        }));
        // step: calculate total_products_rating
        const productReviews = await prisma_1.prisma.review.findMany({
            where: {
                target_type: "PRODUCT",
                target_id: { in: productIds },
                status: "APPROVED",
                rating: { not: null },
            },
            select: {
                target_id: true,
                rating: true,
            },
        });
        const ratingMap = new Map();
        productReviews.forEach((review) => {
            if (review.target_id && review.rating !== null) {
                const current = ratingMap.get(review.target_id) || { sum: 0, count: 0 };
                current.sum += review.rating;
                current.count += 1;
                ratingMap.set(review.target_id, current);
            }
        });
        const total_products_rating = supplierProducts
            .filter((p) => ratingMap.has(p.id))
            .map((product) => {
            const ratingData = ratingMap.get(product.id);
            return {
                product_name: product.name,
                total_rating: Number((ratingData.sum / ratingData.count).toFixed(1)),
            };
        });
        // step: calculate sales_history
        const salesMap = new Map();
        orderItems.forEach((item) => {
            if (item.product_id) {
                const productName = item.snapshot_product_name ||
                    supplierProducts.find((p) => p.id === item.product_id)?.name ||
                    "Unknown";
                const current = salesMap.get(item.product_id) || {
                    product_name: productName,
                    total_ordered_amount: 0,
                    total_ordered_price: 0,
                    all_customers: new Set(),
                };
                current.total_ordered_amount += Number(item.amount || 0);
                current.total_ordered_price += Number(item.total_price || 0);
                if (item.order?.User?.full_name) {
                    current.all_customers.add(item.order.User.full_name);
                }
                salesMap.set(item.product_id, current);
            }
        });
        const sales_history = Array.from(salesMap.values()).map((sale) => ({
            product_name: sale.product_name,
            total_ordered_amount: sale.total_ordered_amount,
            total_ordered_price: sale.total_ordered_price,
            all_customers: Array.from(sale.all_customers),
        }));
        // step: upsert SupplierStat table
        await prisma_1.prisma.supplierStat.upsert({
            where: { supplier_id: user.id },
            update: {
                total_customers,
                total_orders,
                total_delivered_orders,
                total_cancelled_orders,
                total_active_products,
                last_order_date,
                category_stat: category_stat,
                brand_stat: brand_stat,
                total_products_rating: total_products_rating,
                sales_history: sales_history,
            },
            create: {
                supplier_id: user.id,
                total_customers,
                total_orders,
                total_delivered_orders,
                total_cancelled_orders,
                total_active_products,
                last_order_date,
                category_stat: category_stat,
                brand_stat: brand_stat,
                total_products_rating: total_products_rating,
                sales_history: sales_history,
            },
        });
        return (0, response_handler_1.responseHandler)({
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
    getStat = async (req, res, next) => {
        const user = res.locals.user;
        const { isAdvancedStat } = req.query;
        // step: get stats from SupplierStat table
        const stats = await prisma_1.prisma.supplierStat.findUnique({
            where: { supplier_id: user.id },
        });
        if (!stats) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Stats not found. Please update stats first.");
        }
        // step: if isAdvancedStat is false, exclude sales_history
        if (isAdvancedStat === "true") {
            return (0, response_handler_1.responseHandler)({
                res,
                message: "Stats returned successfully",
                data: { stats },
            });
        }
        // step: return stats without sales_history
        const { sales_history, ...basicStats } = stats;
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Stats returned successfully",
            data: { stats: basicStats },
        });
    };
    // ============================ softDelete ============================
    softDelete = async (req, res, next) => {
        const user = res.locals.user;
        // step: check if user is already soft deleted
        if (user.deleted_at) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Account is already marked for deletion");
        }
        // step: check delete validation (no product in active orders)
        const activeOrderItems = await prisma_1.prisma.orderItem.findFirst({
            where: {
                product: { supplier_id: user.id },
                order: {
                    status: { in: ["PENDING", "APPROVED"] },
                },
            },
        });
        if (activeOrderItems) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cannot delete account. You have products in active orders.");
        }
        // step: check delete validation (no product in carts)
        const activeCartItems = await prisma_1.prisma.cartItem.findFirst({
            where: {
                product: { supplier_id: user.id },
            },
        });
        if (activeCartItems) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cannot delete account. You have products in customer carts.");
        }
        // step: soft delete user by setting deleted_at
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { deleted_at: new Date() },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Account marked for deletion successfully",
        });
    };
    // ============================ hardDelete ============================
    hardDelete = async (req, res, next) => {
        const user = res.locals.user;
        // step: check delete validation (no product in active orders)
        const activeOrderItems = await prisma_1.prisma.orderItem.findFirst({
            where: {
                product: { supplier_id: user.id },
                order: {
                    status: { in: ["PENDING", "APPROVED"] },
                },
            },
        });
        if (activeOrderItems) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cannot delete account. You have products in active orders.");
        }
        // step: check delete validation (no product in carts)
        const activeCartItems = await prisma_1.prisma.cartItem.findFirst({
            where: {
                product: { supplier_id: user.id },
            },
        });
        if (activeCartItems) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Cannot delete account. You have products in customer carts.");
        }
        // step: delete supplier related data first (due to foreign key constraints)
        await prisma_1.prisma.$transaction(async (tx) => {
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
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Account deleted permanently",
        });
    };
    // ============================ cancelSoftDelete ============================
    cancelSoftDelete = async (req, res, next) => {
        const user = res.locals.user;
        // step: check if user is soft deleted
        if (!user.deleted_at) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Account is not marked for deletion");
        }
        // step: cancel soft delete by clearing deleted_at
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { deleted_at: null },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Account deletion cancelled successfully",
        });
    };
}
exports.ProfileService = ProfileService;
