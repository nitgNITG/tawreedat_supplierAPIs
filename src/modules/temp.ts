// generator client {
//   provider = "prisma-client-js"
//   output   = "../generated/prisma"
// }

// datasource db {
//   provider = "mysql"
// }

// // ========== Enums ==========
// enum DiscountType {
//   percent
//   fixed
// }

// enum ContractStatus {
//   active
//   completed
//   cancelled
// }

// enum Gender {
//   male
//   female
// }

// // ========== Users ==========
// model Users {
//   id                    Int       @id @default(autoincrement())
//   role_id               Int?
//   full_name             String    @db.VarChar(191)
//   email                 String    @unique @db.VarChar(191)
//   phone                 String?   @unique @db.VarChar(191)
//   password              String    @db.VarChar(191)
//   image_url             String?   @db.VarChar(191)
//   lang                  String?   @default("ar") @db.VarChar(10)
//   last_login_at         DateTime?
//   otp                   String?   @db.VarChar(10)
//   is_confirmed          Boolean   @default(false)
//   password_last_updated DateTime?
//   birth_date            DateTime?
//   gender                Gender?
//   fcm_token             String?   @db.VarChar(191)
//   login_type            String?   @db.VarChar(50)
//   apple_id              String?   @db.VarChar(191)
//   created_at            DateTime  @default(now())
//   updated_at            DateTime  @updatedAt
//   deleted_at            DateTime?

//   // Relations
//   role     UserRoles? @relation(fields: [role_id], references: [id])
//   supplier Suppliers?
// }

// model UserRoles {
//   id          Int       @id @default(autoincrement())
//   name        String    @db.VarChar(191)
//   description String?   @db.VarChar(191)
//   created_at  DateTime  @default(now())
//   updated_at  DateTime  @updatedAt
//   deleted_at  DateTime?

//   // Relations
//   users Users[]
// }

// // ========== Suppliers ==========
// model Suppliers {
//   id                  Int       @id
//   type_id             Int?
//   badges_id           Int?
//   national_id         String?   @db.VarChar(191)
//   synonyms            String?   @db.VarChar(191)
//   taxCard             String?   @db.VarChar(191)
//   commercial_register String?   @db.VarChar(191)
//   is_approved         Boolean   @default(false)
//   is_active           Boolean   @default(false)
//   created_at          DateTime  @default(now())
//   updated_at          DateTime  @updatedAt
//   deleted_at          DateTime?

//   // Relations
//   user      Users                    @relation(fields: [id], references: [id], onDelete: Cascade)
//   type      SupplierTypes?           @relation(fields: [type_id], references: [id], onDelete: SetNull)
//   badge     SupplierBadges?          @relation(fields: [badges_id], references: [id], onDelete: SetNull)
//   addresses SupplierStoreAddresses[]
//   stats     SupplierStats?
//   products  Products[]
//   contracts Contracts[]
// }

// model SupplierTypes {
//   id          Int       @id @default(autoincrement())
//   name        String    @db.VarChar(191)
//   description String?   @db.VarChar(191)
//   synonyms    String?   @db.VarChar(191)
//   created_at  DateTime  @default(now())
//   updated_at  DateTime  @updatedAt
//   deleted_at  DateTime?

//   // Relations
//   suppliers Suppliers[]
// }

// model SupplierStoreAddresses {
//   id                 Int       @id @default(autoincrement())
//   supplier_id        Int
//   address_line_1     String?   @db.VarChar(191)
//   address_line_2     String?   @db.VarChar(191)
//   city               String?   @db.VarChar(191)
//   state              String?   @db.VarChar(191)
//   country            String    @default("Egypt") @db.VarChar(191)
//   postal_code        String?   @db.VarChar(191)
//   latitude           Decimal?  @db.Decimal(10, 8)
//   longitude          Decimal?  @db.Decimal(11, 8)
//   contact_name       String?   @db.VarChar(191)
//   contact_phone      String?   @db.VarChar(191)
//   working_hours      Json?
//   delivery_radius_km Decimal?  @db.Decimal(10, 2)
//   covered_cities     Json?
//   created_at         DateTime  @default(now())
//   updated_at         DateTime  @updatedAt
//   deleted_at         DateTime?

//   // Relations
//   supplier Suppliers @relation(fields: [supplier_id], references: [id], onDelete: Cascade)
// }

// model SupplierActivity {
//   id                 Int       @id @default(autoincrement())
//   product_id         Int
//   old_price_out_site Decimal?  @db.Decimal(10, 2)
//   new_price_out_site Decimal?  @db.Decimal(10, 2)
//   changed_by_id      Int?
//   change_reason      String?   @db.VarChar(191)
//   created_at         DateTime  @default(now())
//   updated_at         DateTime  @updatedAt
//   deleted_at         DateTime?

//   // Relations
//   product Products @relation(fields: [product_id], references: [id], onDelete: Cascade)
// }

// model SupplierStats {
//   supplier_id          Int       @id
//   total_contract_value Decimal?  @db.Decimal(15, 2)
//   total_customers      Int       @default(0)
//   active_products      Int       @default(0)
//   total_orders         Int       @default(0)
//   delivered_orders     Int       @default(0)
//   cancelled_orders     Int       @default(0)
//   rating               Decimal?  @db.Decimal(3, 2)
//   last_order_date      DateTime?
//   created_at           DateTime  @default(now())
//   updated_at           DateTime  @updatedAt

//   // Relations
//   supplier Suppliers @relation(fields: [supplier_id], references: [id], onDelete: Cascade)
// }

// model SupplierBadges {
//   id               Int      @id @default(autoincrement())
//   name             String   @db.VarChar(191)
//   description      String?  @db.Text
//   min_value        Decimal? @db.Decimal(15, 2)
//   max_value        Decimal? @db.Decimal(15, 2)
//   visibility_score Int?

//   // Relations
//   suppliers Suppliers[]
// }

// // ========== Categories & Brands ==========
// model Categories {
//   id                 Int      @id @default(autoincrement())
//   parent_id          Int?
//   sort_id            Int      @default(0)
//   name               String   @db.VarChar(191)
//   name_ar            String?  @db.VarChar(191)
//   description        String?  @db.LongText
//   description_ar     String?  @db.LongText
//   synonyms           String   @db.VarChar(191)
//   images_url         String?  @db.VarChar(191)
//   icons_url          String?  @db.VarChar(191)
//   is_active          Boolean  @default(true)
//   product_attributes String?  @db.LongText
//   created_at         DateTime @default(now()) @db.DateTime(3)
//   updated_at         DateTime @updatedAt @db.DateTime(3)

//   // Relations
//   brands          Brands[]
//   products        Products[]
//   brandCategories BrandCategories[]
// }

// model BrandCategories {
//   id          Int      @id @default(autoincrement())
//   brand_id    Int
//   category_id Int
//   created_at  DateTime @default(now()) @db.DateTime(3)

//   // Relations
//   brand    Brands     @relation(fields: [brand_id], references: [id], onDelete: Cascade)
//   category Categories @relation(fields: [category_id], references: [id], onDelete: Cascade)
// }

// model Brands {
//   id             Int      @id @default(autoincrement())
//   category_id    Int?
//   name           String   @db.VarChar(191)
//   name_ar        String?  @db.VarChar(191)
//   description    String?  @db.LongText
//   description_ar String?  @db.LongText
//   synonyms       String   @db.VarChar(191)
//   logos_url      String?  @db.VarChar(191)
//   covers_url     String?  @db.VarChar(191)
//   up_to          Int?
//   is_popular     Boolean  @default(false)
//   is_active      Boolean  @default(true)
//   is_deleted     Boolean  @default(false)
//   sort_id        Int      @default(0)
//   created_at     DateTime @default(now()) @db.DateTime(3)
//   updated_at     DateTime @updatedAt @db.DateTime(3)

//   // Relations
//   category        Categories?       @relation(fields: [category_id], references: [id], onDelete: SetNull)
//   products        Products[]
//   brandCategories BrandCategories[]
// }

// // ========== Products ==========
// model Products {
//   id                               Int           @id @default(autoincrement())
//   supplier_id                      Int
//   category_id                      Int?
//   brand_id                         Int?
//   unit_types                       Int?
//   name                             String        @db.VarChar(191)
//   name_ar                          String?       @db.VarChar(191)
//   description                      String?       @db.Text
//   description_ar                   String?       @db.Text
//   barcode                          String?       @db.VarChar(191)
//   images_url                       String?       @db.VarChar(191)
//   color                            String?       @db.VarChar(191)
//   price_out_site                   Decimal?      @db.Decimal(10, 2)
//   discount_type                    DiscountType?
//   discount_value_total             Decimal?      @db.Decimal(10, 2)
//   discount_value_part_for_customer Decimal?      @db.Decimal(10, 2)
//   discount_value_part_for_company  Decimal?      @db.Decimal(10, 2)
//   discount_value_part_for_offers   Decimal?      @db.Decimal(10, 2)
//   available_amount                 Decimal?      @db.Decimal(10, 2)
//   reserved_in_carts_amount         Decimal?      @db.Decimal(10, 2)
//   ordered_amount                   Decimal?      @db.Decimal(10, 2)
//   is_active                        Boolean       @default(true)
//   synonyms                         String?       @db.VarChar(191)
//   min_discount_rate                Decimal?      @db.Decimal(5, 2)
//   min_amount_for_one_user          Decimal?      @db.Decimal(10, 2)
//   max_amount_for_one_user          Decimal?      @db.Decimal(10, 2)
//   min_amount_for_one_order         Decimal?      @db.Decimal(10, 2)
//   max_amount_for_one_order         Decimal?      @db.Decimal(10, 2)
//   refundable                       Boolean       @default(false)
//   refundable_period                Decimal?      @db.Decimal(5, 2)
//   refund_policy                    String?       @db.Text
//   created_at                       DateTime      @default(now())
//   updated_at                       DateTime      @updatedAt
//   deleted_at                       DateTime?

//   // Relations
//   supplier           Suppliers           @relation(fields: [supplier_id], references: [id], onDelete: Cascade)
//   category           Categories?         @relation(fields: [category_id], references: [id], onDelete: SetNull)
//   brand              Brands?             @relation(fields: [brand_id], references: [id], onDelete: SetNull)
//   unit               ProductUnit?        @relation(fields: [unit_types], references: [id], onDelete: SetNull)
//   attributes         ProductAttributes[]
//   offers             Offers[]
//   supplierActivities SupplierActivity[]
// }

// model ProductAttributes {
//   id         Int     @id @default(autoincrement())
//   key        String  @db.VarChar(191)
//   value      String  @db.VarChar(191)
//   product_id Int
//   value_ar   String? @db.VarChar(191)

//   // Relations
//   product Products @relation(fields: [product_id], references: [id], onDelete: Cascade)

//   @@map("productAttributes")
// }

// model ProductUnit {
//   id             Int      @id @default(autoincrement())
//   name           String   @db.VarChar(191)
//   price          Decimal? @db.Decimal(10, 2)
//   description    String?  @db.VarChar(191)
//   description_ar String?  @db.VarChar(191)

//   // Relations
//   products Products[]
// }

// model Offers {
//   id                       Int      @id @default(autoincrement())
//   product_id               Int
//   target_customer_badge_id Int?
//   offer_type               String?  @db.VarChar(191)
//   offer_value              Decimal? @db.Decimal(10, 2)
//   start_date               DateTime @db.Date
//   end_date                 DateTime @db.Date
//   is_active                Boolean  @default(true)
//   synonyms                 String?  @db.VarChar(191)
//   created_at               DateTime @default(now())
//   updated_at               DateTime @updatedAt

//   // Relations
//   product Products @relation(fields: [product_id], references: [id], onDelete: Cascade)
// }

// model Contracts {
//   id                 Int            @id @default(autoincrement())
//   supplier_id        Int
//   details            String?        @db.VarChar(191)
//   min_discount_ratio Decimal?       @db.Decimal(5, 2)
//   max_discount_ratio Decimal?       @db.Decimal(5, 2)
//   start_date         DateTime       @db.Date
//   end_date           DateTime       @db.Date
//   status             ContractStatus @default(active)
//   created_at         DateTime       @default(now())
//   updated_at         DateTime       @updatedAt
//   deleted_at         DateTime?

//   // Relations
//   supplier Suppliers @relation(fields: [supplier_id], references: [id], onDelete: Cascade)
// }


