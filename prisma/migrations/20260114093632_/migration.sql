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

    UNIQUE INDEX `user_role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_verify` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL DEFAULT NULL,
    `phone` VARCHAR(191) NULL DEFAULT NULL,
    `code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

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

    UNIQUE INDEX `supplier_type_name_key`(`name`),
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

    UNIQUE INDEX `supplier_badge_name_key`(`name`),
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

    UNIQUE INDEX `category_name_key`(`name`),
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
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL DEFAULT NULL,
    `description` LONGTEXT NULL DEFAULT NULL,
    `description_ar` LONGTEXT NULL DEFAULT NULL,
    `synonyms` VARCHAR(191) NULL,
    `logo_url` VARCHAR(191) NULL DEFAULT NULL,
    `cover_url` VARCHAR(191) NULL DEFAULT NULL,
    `up_to` INTEGER NULL DEFAULT NULL,
    `is_popular` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `sort_id` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brand_name_key`(`name`),
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
    `name` VARCHAR(191) NULL,
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
    `status` ENUM('pending', 'active', 'inactive', 'cancelled') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` VARCHAR(191) NOT NULL,
    `type_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `admin_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_activity` (
    `id` VARCHAR(191) NOT NULL,
    `admin_id` VARCHAR(191) NULL,
    `target_module` ENUM('Products', 'Suppliers', 'Offers', 'Ads') NULL,
    `activity_type` ENUM('create', 'update', 'delete', 'view') NULL,
    `activity_description` VARCHAR(191) NULL,
    `extra_info` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad` (
    `id` VARCHAR(191) NOT NULL,
    `ad_type` ENUM('external', 'internal') NULL,
    `source` VARCHAR(191) NULL,
    `budget` DECIMAL(65, 30) NULL,
    `title` TEXT NULL,
    `title_ar` TEXT NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `priority` INTEGER NULL,
    `status` ENUM('draft', 'active', 'paused', 'expired') NULL,
    `image_url` VARCHAR(191) NULL,
    `target_url` VARCHAR(191) NULL,
    `placement` ENUM('Top', 'Middle', 'Bottom') NULL,
    `popup_size` ENUM('Small', 'Medium', 'Large') NULL,
    `closable` BOOLEAN NULL,
    `mobile_screen` TEXT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `time_slots` JSON NULL,
    `duration_seconds` INTEGER NULL,
    `shown_seconds` INTEGER NULL,
    `first_shown_at` DATETIME(3) NULL,
    `last_shown_at` DATETIME(3) NULL,
    `target_customer_badge_id` VARCHAR(191) NULL,
    `target_supplier_badge_id` VARCHAR(191) NULL,
    `sort_id` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint` (
    `id` VARCHAR(191) NOT NULL,
    `created_by_type` ENUM('customer', 'supplier') NULL,
    `created_by_id` VARCHAR(191) NULL,
    `order_id` VARCHAR(191) NULL,
    `supplier_id` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `status` ENUM('open', 'in_progress', 'resolved', 'closed') NULL,
    `priority` ENUM('low', 'medium', 'high') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `complaint_message` (
    `id` VARCHAR(191) NOT NULL,
    `complaint_id` VARCHAR(191) NULL,
    `sender_id` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `link` VARCHAR(191) NULL,
    `notification_type` ENUM('info', 'warning', 'success', 'error') NULL,
    `channel` ENUM('email', 'sms') NULL,
    `is_read` BOOLEAN NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review` (
    `id` VARCHAR(191) NOT NULL,
    `reviewer_id` VARCHAR(191) NULL,
    `target_type` ENUM('supplier', 'product', 'representative') NULL,
    `target_id` VARCHAR(191) NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `order_id` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_setting` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `channel` ENUM('email', 'sms') NULL,
    `enabled` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer` (
    `id` VARCHAR(191) NOT NULL,
    `type_id` VARCHAR(191) NULL,
    `badge_id` VARCHAR(191) NULL,
    `class_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `customer_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_address` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `address_line_1` VARCHAR(191) NULL,
    `address_line_2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL DEFAULT 'Egypt',
    `postal_code` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `recipient_name` VARCHAR(191) NULL,
    `recipient_phone` VARCHAR(191) NULL,
    `delivery_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_stat` (
    `customer_id` VARCHAR(191) NOT NULL,
    `last_order_date` DATETIME(3) NULL,
    `total_spent` DECIMAL(65, 30) NULL,
    `total_orders` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_badge` (
    `id` VARCHAR(191) NOT NULL,
    `name` ENUM('Basic', 'Standard', 'VIP') NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_class` (
    `id` VARCHAR(191) NOT NULL,
    `name` ENUM('new', 'repeat', 'loyal', 'lost') NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart` (
    `id` VARCHAR(191) NOT NULL,
    `customer_id` VARCHAR(191) NULL,
    `total_price` DECIMAL(65, 30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `cart_customer_id_key`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_item` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `product_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NULL,
    `total_price` DECIMAL(65, 30) NULL,
    `product_id` VARCHAR(191) NULL,
    `snapshot_product_name` VARCHAR(191) NULL,
    `snapshot_product_description` VARCHAR(191) NULL,
    `snapshot_unit_type` VARCHAR(191) NULL,
    `snapshot_unit_name` VARCHAR(191) NULL,
    `snapshot_price_out_site` DECIMAL(65, 30) NULL,
    `snapshot_discount_value_part_for_site` DECIMAL(65, 30) NULL,
    `offer_id` VARCHAR(191) NULL,
    `snapshot_offer_type` VARCHAR(191) NULL,
    `snapshot_offer_value` DECIMAL(65, 30) NULL,
    `snapshot_start_date` DATE NULL,
    `snapshot_end_date` DATE NULL,
    `snapshot_offer_is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_item` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NULL,
    `total_price` DECIMAL(65, 30) NULL,
    `product_id` VARCHAR(191) NULL,
    `snapshot_product_name` VARCHAR(191) NULL,
    `snapshot_product_description` VARCHAR(191) NULL,
    `snapshot_unit_type` VARCHAR(191) NULL,
    `snapshot_unit_name` VARCHAR(191) NULL,
    `snapshot_price_out_site` DECIMAL(65, 30) NULL,
    `snapshot_discount_value_part_for_site` DECIMAL(65, 30) NULL,
    `offer_id` VARCHAR(191) NULL,
    `snapshot_offer_type` VARCHAR(191) NULL,
    `snapshot_offer_value` DECIMAL(65, 30) NULL,
    `snapshot_start_date` DATE NULL,
    `snapshot_end_date` DATE NULL,
    `snapshot_offer_is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` VARCHAR(191) NOT NULL,
    `cart_id` VARCHAR(191) NULL,
    `order_number` INTEGER NULL,
    `total_price` DECIMAL(65, 30) NULL,
    `shipping_cost` DECIMAL(65, 30) NULL,
    `tax_amount` DECIMAL(65, 30) NULL,
    `notes` VARCHAR(191) NULL,
    `shipping_address_id` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'delivered', 'cancelled', 'refunded') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_transaction` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NULL,
    `payment_type` ENUM('card', 'wallet', 'instapay', 'installment') NULL,
    `amount` DECIMAL(65, 30) NULL,
    `currency` VARCHAR(191) NULL DEFAULT 'EGP',
    `status` ENUM('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded') NULL,
    `paid_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `card_payment_detail` (
    `id` VARCHAR(191) NOT NULL,
    `payment_transaction_id` VARCHAR(191) NULL,
    `provider` ENUM('paymob', 'fawry') NULL,
    `card_brand` ENUM('visa', 'mastercard', 'meeza') NULL,
    `card_last_four` VARCHAR(191) NULL,
    `card_holder_name` VARCHAR(191) NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `provider_reference` VARCHAR(191) NULL,
    `provider_response` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `card_payment_detail_payment_transaction_id_key`(`payment_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_payment_detail` (
    `id` VARCHAR(191) NOT NULL,
    `payment_transaction_id` VARCHAR(191) NULL,
    `provider` ENUM('vodafone_cash', 'orange_cash', 'etisalat_cash', 'we_pay') NULL,
    `wallet_phone` VARCHAR(191) NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `provider_reference` VARCHAR(191) NULL,
    `provider_response` JSON NULL,
    `confirmation_screenshot_url` VARCHAR(191) NULL,
    `confirmation_status` ENUM('pending', 'confirmed', 'rejected') NULL DEFAULT 'pending',
    `confirmed_by_admin_id` VARCHAR(191) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `wallet_payment_detail_payment_transaction_id_key`(`payment_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instapay_payment_detail` (
    `id` VARCHAR(191) NOT NULL,
    `payment_transaction_id` VARCHAR(191) NULL,
    `sender_ipa` VARCHAR(191) NULL,
    `receiver_ipa` VARCHAR(191) NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `provider_reference` VARCHAR(191) NULL,
    `provider_response` JSON NULL,
    `confirmation_screenshot_url` VARCHAR(191) NULL,
    `confirmation_status` ENUM('pending', 'confirmed', 'rejected') NULL DEFAULT 'pending',
    `confirmed_by_admin_id` VARCHAR(191) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `instapay_payment_detail_payment_transaction_id_key`(`payment_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `installment_payment_detail` (
    `id` VARCHAR(191) NOT NULL,
    `payment_transaction_id` VARCHAR(191) NULL,
    `provider` ENUM('valu', 'halan', 'sympl', 'souhoola', 'contact') NULL,
    `total_amount` DECIMAL(65, 30) NULL,
    `down_payment` DECIMAL(65, 30) NULL,
    `installment_months` INTEGER NULL,
    `monthly_amount` DECIMAL(65, 30) NULL,
    `interest_rate` DECIMAL(65, 30) NULL,
    `customer_national_id` VARCHAR(191) NULL,
    `provider_transaction_id` VARCHAR(191) NULL,
    `provider_reference` VARCHAR(191) NULL,
    `provider_response` JSON NULL,
    `installments_paid` INTEGER NULL DEFAULT 0,
    `next_due_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `installment_payment_detail_payment_transaction_id_key`(`payment_transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refund` (
    `id` VARCHAR(191) NOT NULL,
    `original_transaction_id` VARCHAR(191) NULL,
    `refund_amount` DECIMAL(65, 30) NULL,
    `refund_reason` VARCHAR(191) NULL,
    `refund_method` ENUM('same_method') NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed') NULL,
    `provider_refund_id` VARCHAR(191) NULL,
    `provider_response` JSON NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_representative` (
    `id` VARCHAR(191) NOT NULL,
    `type_id` VARCHAR(191) NULL,
    `national_id` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive', 'suspended') NULL,
    `is_available` BOOLEAN NULL DEFAULT true,
    `vehicle_type` ENUM('motorcycle', 'car', 'van', 'truck') NULL,
    `vehicle_plate` VARCHAR(191) NULL,
    `max_load` DECIMAL(65, 30) NULL,
    `current_latitude` DECIMAL(65, 30) NULL,
    `current_longitude` DECIMAL(65, 30) NULL,
    `last_location_update` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_representative_type` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `shipping_representative_type_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_representative_stat` (
    `representative_id` VARCHAR(191) NOT NULL,
    `total_deliveries` INTEGER NULL,
    `successful_deliveries` INTEGER NULL,
    `failed_deliveries` INTEGER NULL,
    `rating` DECIMAL(65, 30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`representative_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `governorate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_area` (
    `id` VARCHAR(191) NOT NULL,
    `governorate_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `representative_coverage_area` (
    `id` VARCHAR(191) NOT NULL,
    `representative_ids` JSON NULL,
    `governorate_ids` JSON NULL,
    `area_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_price` (
    `id` VARCHAR(191) NOT NULL,
    `region_id` INTEGER NOT NULL,
    `method_id` INTEGER NOT NULL,
    `base_price` DOUBLE NOT NULL,
    `additional_weight_price` DOUBLE NOT NULL,
    `estimated_delivery_days` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_assignment` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NULL,
    `representative_id` VARCHAR(191) NULL,
    `status` ENUM('assigned', 'accepted', 'rejected', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned') NULL,
    `pickup_address_id` VARCHAR(191) NULL,
    `estimated_pickup_time` DATETIME(3) NULL,
    `actual_pickup_time` DATETIME(3) NULL,
    `delivery_address_id` VARCHAR(191) NULL,
    `estimated_delivery_time` DATETIME(3) NULL,
    `actual_delivery_time` DATETIME(3) NULL,
    `failure_reason` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_handover_confirmation` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NULL,
    `supplier_id` VARCHAR(191) NULL,
    `items_amount` DECIMAL(65, 30) NULL,
    `package_condition` ENUM('good', 'damaged', 'incomplete') NULL,
    `condition_notes` TEXT NULL,
    `photos_url` VARCHAR(191) NULL,
    `receipt_number` VARCHAR(191) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `representative_pickup_confirmation` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NULL,
    `representative_id` VARCHAR(191) NULL,
    `items_amount` DECIMAL(65, 30) NULL,
    `package_condition` ENUM('good', 'damaged', 'incomplete') NULL,
    `condition_notes` TEXT NULL,
    `photos_url` VARCHAR(191) NULL,
    `receipt_number` VARCHAR(191) NULL,
    `pickup_latitude` DECIMAL(65, 30) NULL,
    `pickup_longitude` DECIMAL(65, 30) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `representative_delivery_confirmation` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NULL,
    `representative_id` VARCHAR(191) NULL,
    `items_amount` DECIMAL(65, 30) NULL,
    `package_condition` ENUM('good', 'damaged', 'incomplete') NULL,
    `condition_notes` TEXT NULL,
    `photos_url` VARCHAR(191) NULL,
    `pickup_latitude` DECIMAL(65, 30) NULL,
    `pickup_longitude` DECIMAL(65, 30) NULL,
    `otp_sended` INTEGER NULL,
    `confirmed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_receipt_confirmation` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NULL,
    `customer_id` VARCHAR(191) NULL,
    `items_amount` DECIMAL(65, 30) NULL,
    `package_condition` ENUM('good', 'damaged', 'incomplete') NULL,
    `condition_notes` TEXT NULL,
    `photos_url` VARCHAR(191) NULL,
    `receipt_number` VARCHAR(191) NULL,
    `otp_verified` BOOLEAN NULL,
    `confirmed_at` DATETIME(3) NULL,
    `product_rating` INTEGER NULL,
    `representative_rating` INTEGER NULL,
    `delivery_feedback` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_issue` (
    `id` VARCHAR(191) NOT NULL,
    `assignment_id` VARCHAR(191) NULL,
    `issue_type` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `photo_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `about_app` (
    `id` VARCHAR(191) NOT NULL,
    `terms` TEXT NULL,
    `terms_ar` TEXT NULL,
    `about` TEXT NULL,
    `about_ar` TEXT NULL,
    `privacy_policy` TEXT NULL,
    `privacy_policy_ar` TEXT NULL,
    `mission` TEXT NULL,
    `mission_ar` TEXT NULL,
    `vision` TEXT NULL,
    `vision_ar` TEXT NULL,
    `digital_card` TEXT NULL,
    `digital_card_ar` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `facebook` VARCHAR(200) NULL,
    `instagram` VARCHAR(200) NULL,
    `linkedin` VARCHAR(200) NULL,
    `pinterest` VARCHAR(200) NULL,
    `reddit` VARCHAR(200) NULL,
    `snapchat` VARCHAR(200) NULL,
    `telegram` VARCHAR(200) NULL,
    `tiktok` VARCHAR(200) NULL,
    `twitter` VARCHAR(200) NULL,
    `whatsapp` VARCHAR(200) NULL,
    `youtube` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_settings` (
    `id` VARCHAR(191) NOT NULL,
    `number_of_products_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `number_of_categories_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `number_of_featured_products_on_homepage` INTEGER NOT NULL DEFAULT 10,
    `number_of_latest_offers_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `number_of_new_arrivals_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `vat` DOUBLE NOT NULL DEFAULT 5,
    `last_attempt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `login_attempt_duration_minutes` SMALLINT NULL DEFAULT 20,
    `login_attempts` SMALLINT NULL DEFAULT 5,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `login_as_guest` BOOLEAN NOT NULL DEFAULT false,
    `permanent_delete` BOOLEAN NOT NULL DEFAULT false,
    `number_of_ads_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `number_of_brands_on_homepage` INTEGER NOT NULL DEFAULT 3,
    `app_android_url` VARCHAR(191) NULL,
    `app_android_version` VARCHAR(191) NULL,
    `app_ios_url` VARCHAR(191) NULL,
    `app_ios_version` VARCHAR(191) NULL,
    `paymob_api_key` LONGTEXT NULL,
    `paymob_base_url` VARCHAR(191) NULL,
    `paymob_payment_methods` VARCHAR(191) NULL,
    `paymob_public_key` VARCHAR(191) NULL,
    `paymob_secret_key` VARCHAR(191) NULL,
    `payment_attempts` SMALLINT NULL DEFAULT 5,
    `paymob_iframes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `article` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `summary` VARCHAR(500) NULL,
    `content` TEXT NOT NULL,
    `cover_image` VARCHAR(191) NULL,
    `keywords` VARCHAR(255) NULL,
    `published_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `author` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_us` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `response` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faq` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `language` ENUM('EN', 'AR') NULL DEFAULT 'EN',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sealing_unit` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `user_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `offer` ADD CONSTRAINT `offer_target_customer_badge_id_fkey` FOREIGN KEY (`target_customer_badge_id`) REFERENCES `customer_badge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contract` ADD CONSTRAINT `contract_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `admin_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_activity` ADD CONSTRAINT `admin_activity_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ad` ADD CONSTRAINT `ad_target_customer_badge_id_fkey` FOREIGN KEY (`target_customer_badge_id`) REFERENCES `customer_badge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ad` ADD CONSTRAINT `ad_target_supplier_badge_id_fkey` FOREIGN KEY (`target_supplier_badge_id`) REFERENCES `supplier_badge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint` ADD CONSTRAINT `complaint_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint` ADD CONSTRAINT `complaint_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaint_message` ADD CONSTRAINT `complaint_message_complaint_id_fkey` FOREIGN KEY (`complaint_id`) REFERENCES `complaint`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `customer_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `customer_badge`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `customer_class`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_address` ADD CONSTRAINT `customer_address_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_stat` ADD CONSTRAINT `customer_stat_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_item` ADD CONSTRAINT `wishlist_item_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_item` ADD CONSTRAINT `wishlist_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `offer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item` ADD CONSTRAINT `cart_item_offer_id_fkey` FOREIGN KEY (`offer_id`) REFERENCES `offer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_shipping_address_id_fkey` FOREIGN KEY (`shipping_address_id`) REFERENCES `customer_address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transaction` ADD CONSTRAINT `payment_transaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `card_payment_detail` ADD CONSTRAINT `card_payment_detail_payment_transaction_id_fkey` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_payment_detail` ADD CONSTRAINT `wallet_payment_detail_payment_transaction_id_fkey` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_payment_detail` ADD CONSTRAINT `wallet_payment_detail_confirmed_by_admin_id_fkey` FOREIGN KEY (`confirmed_by_admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instapay_payment_detail` ADD CONSTRAINT `instapay_payment_detail_payment_transaction_id_fkey` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instapay_payment_detail` ADD CONSTRAINT `instapay_payment_detail_confirmed_by_admin_id_fkey` FOREIGN KEY (`confirmed_by_admin_id`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `installment_payment_detail` ADD CONSTRAINT `installment_payment_detail_payment_transaction_id_fkey` FOREIGN KEY (`payment_transaction_id`) REFERENCES `payment_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refund` ADD CONSTRAINT `refund_original_transaction_id_fkey` FOREIGN KEY (`original_transaction_id`) REFERENCES `payment_transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_representative` ADD CONSTRAINT `shipping_representative_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `shipping_representative_type`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_representative_stat` ADD CONSTRAINT `shipping_representative_stat_representative_id_fkey` FOREIGN KEY (`representative_id`) REFERENCES `shipping_representative`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_area` ADD CONSTRAINT `delivery_area_governorate_id_fkey` FOREIGN KEY (`governorate_id`) REFERENCES `governorate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_coverage_area` ADD CONSTRAINT `representative_coverage_area_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `delivery_area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_coverage_area` ADD CONSTRAINT `RepCoverage_Rep_fk` FOREIGN KEY (`id`) REFERENCES `shipping_representative`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_coverage_area` ADD CONSTRAINT `RepCoverage_Gov_fk` FOREIGN KEY (`id`) REFERENCES `governorate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_assignment` ADD CONSTRAINT `order_assignment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_assignment` ADD CONSTRAINT `order_assignment_representative_id_fkey` FOREIGN KEY (`representative_id`) REFERENCES `shipping_representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_assignment` ADD CONSTRAINT `order_assignment_pickup_address_id_fkey` FOREIGN KEY (`pickup_address_id`) REFERENCES `supplier_store_address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_assignment` ADD CONSTRAINT `order_assignment_delivery_address_id_fkey` FOREIGN KEY (`delivery_address_id`) REFERENCES `customer_address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_handover_confirmation` ADD CONSTRAINT `supplier_handover_confirmation_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `order_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_handover_confirmation` ADD CONSTRAINT `supplier_handover_confirmation_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_pickup_confirmation` ADD CONSTRAINT `representative_pickup_confirmation_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `order_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_pickup_confirmation` ADD CONSTRAINT `representative_pickup_confirmation_representative_id_fkey` FOREIGN KEY (`representative_id`) REFERENCES `shipping_representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_delivery_confirmation` ADD CONSTRAINT `representative_delivery_confirmation_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `order_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `representative_delivery_confirmation` ADD CONSTRAINT `representative_delivery_confirmation_representative_id_fkey` FOREIGN KEY (`representative_id`) REFERENCES `shipping_representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_receipt_confirmation` ADD CONSTRAINT `customer_receipt_confirmation_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `order_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_receipt_confirmation` ADD CONSTRAINT `customer_receipt_confirmation_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_issue` ADD CONSTRAINT `delivery_issue_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `order_assignment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
