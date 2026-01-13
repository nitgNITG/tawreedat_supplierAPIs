-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `lang` VARCHAR(191) NULL,
    `last_login_at` VARCHAR(191) NULL,
    `is_confirmed` BOOLEAN NULL DEFAULT false,
    `password_last_updated` DATETIME(3) NULL,
    `birth_date` DATETIME(3) NULL,
    `gender` ENUM('male', 'female') NULL,
    `fcm_token` VARCHAR(191) NULL,
    `login_type` VARCHAR(191) NULL,
    `apple_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_verify` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL DEFAULT NULL,
    `phone` VARCHAR(191) NULL DEFAULT NULL,
    `code` VARCHAR(191) NULL,
    `email_otp` VARCHAR(191) NULL DEFAULT NULL,
    `email_otp_expired_at` DATETIME(3) NULL DEFAULT NULL,
    `password_otp` VARCHAR(191) NULL DEFAULT NULL,
    `password_otp_expired_at` DATETIME(3) NULL DEFAULT NULL,
    `new_email` VARCHAR(191) NULL DEFAULT NULL,
    `new_email_otp` VARCHAR(191) NULL DEFAULT NULL,
    `new_email_otp_expired_at` DATETIME(3) NULL DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `user_verify_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` VARCHAR(191) NOT NULL,
    `type_id` VARCHAR(191) NOT NULL,
    `badges_id` VARCHAR(191) NULL,
    `national_id` VARCHAR(191) NOT NULL,
    `synonyms` VARCHAR(191) NULL,
    `tax_card` VARCHAR(191) NOT NULL,
    `commercial_register` VARCHAR(191) NOT NULL,
    `is_approved` BOOLEAN NULL DEFAULT false,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `synonyms` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_store_address` (
    `id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `address_line_1` VARCHAR(191) NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'Egypt',
    `postal_code` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `contact_name` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `working_hours` JSON NULL,
    `delivery_radius_km` DECIMAL(65, 30) NULL,
    `covered_cities` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_activity` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `old_price_out_site` DECIMAL(65, 30) NULL,
    `new_price_out_site` DECIMAL(65, 30) NULL,
    `changed_by_id` VARCHAR(191) NULL,
    `change_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_stat` (
    `supplier_id` VARCHAR(191) NOT NULL,
    `total_contract_value` DECIMAL(65, 30) NULL,
    `total_customers` INTEGER NULL,
    `active_products` INTEGER NULL,
    `total_orders` INTEGER NULL,
    `delivered_orders` INTEGER NULL,
    `cancelled_orders` INTEGER NULL,
    `rating` DECIMAL(65, 30) NULL,
    `last_order_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`supplier_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_badge` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `min_value` DECIMAL(65, 30) NULL,
    `max_value` DECIMAL(65, 30) NULL,
    `visibility_score` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL DEFAULT NULL,
    `sort_id` INTEGER NOT NULL DEFAULT 0,
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL DEFAULT NULL,
    `description` LONGTEXT NULL DEFAULT NULL,
    `description_ar` LONGTEXT NULL DEFAULT NULL,
    `synonyms` VARCHAR(191) NULL,
    `images_url` VARCHAR(191) NULL DEFAULT NULL,
    `icons_url` VARCHAR(191) NULL DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `product_attributes` LONGTEXT NULL DEFAULT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand_category` (
    `id` VARCHAR(191) NOT NULL,
    `brand_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brand` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL DEFAULT NULL,
    `description` LONGTEXT NULL DEFAULT NULL,
    `description_ar` LONGTEXT NULL DEFAULT NULL,
    `synonyms` VARCHAR(191) NULL,
    `logos_url` VARCHAR(191) NULL DEFAULT NULL,
    `covers_url` VARCHAR(191) NULL DEFAULT NULL,
    `up_to` INTEGER NULL DEFAULT NULL,
    `is_popular` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `sort_id` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NULL,
    `brand_id` VARCHAR(191) NULL,
    `unit_types` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `description_ar` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `images_url` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `price_out_site` DECIMAL(65, 30) NULL,
    `discount_type` ENUM('percent', 'fixed') NULL,
    `discount_value_total` DECIMAL(65, 30) NULL,
    `discount_value_part_for_customer` DECIMAL(65, 30) NULL,
    `discount_value_part_for_company` DECIMAL(65, 30) NULL,
    `discount_value_part_for_offers` DECIMAL(65, 30) NULL,
    `available_amount` DECIMAL(65, 30) NULL,
    `reserved_in_carts_amount` DECIMAL(65, 30) NULL,
    `ordered_amount` DECIMAL(65, 30) NULL,
    `is_active` BOOLEAN NULL,
    `synonyms` VARCHAR(191) NULL,
    `min_discount_rate` DECIMAL(65, 30) NULL,
    `min_amount_for_one_user` DECIMAL(65, 30) NULL,
    `max_amount_for_one_user` DECIMAL(65, 30) NULL,
    `min_amount_for_one_order` DECIMAL(65, 30) NULL,
    `max_amount_for_one_order` DECIMAL(65, 30) NULL,
    `refundable` BOOLEAN NULL,
    `refundable_period` DECIMAL(65, 30) NULL,
    `refund_policy` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attribute` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `value_ar` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_unit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(65, 30) NULL,
    `description` VARCHAR(191) NULL,
    `description_ar` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offer` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NULL,
    `target_customer_badge_id` VARCHAR(191) NULL,
    `offer_type` VARCHAR(191) NULL,
    `offer_value` DECIMAL(65, 30) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `synonyms` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contract` (
    `id` VARCHAR(191) NOT NULL,
    `supplier_id` VARCHAR(191) NULL,
    `details` VARCHAR(191) NULL,
    `min_discount_ratio` DECIMAL(65, 30) NULL,
    `max_discount_ratio` DECIMAL(65, 30) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` ENUM('active', 'completed', 'cancelled') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `user_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_id_fkey` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `supplier_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_badges_id_fkey` FOREIGN KEY (`badges_id`) REFERENCES `supplier_badge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_store_address` ADD CONSTRAINT `supplier_store_address_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_activity` ADD CONSTRAINT `supplier_activity_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_stat` ADD CONSTRAINT `supplier_stat_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_category` ADD CONSTRAINT `brand_category_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand_category` ADD CONSTRAINT `brand_category_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brand` ADD CONSTRAINT `brand_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brand`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_unit_types_fkey` FOREIGN KEY (`unit_types`) REFERENCES `product_unit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offer` ADD CONSTRAINT `offer_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
