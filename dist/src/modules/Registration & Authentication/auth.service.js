"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const generateHTML_1 = require("../../utils/sendEmail/generateHTML");
const jwt_1 = require("../../utils/jwt");
const createOtp_1 = require("../../utils/createOtp");
const bcrypt_1 = require("../../utils/bcrypt");
const send_email_1 = require("../../utils/sendEmail/send.email");
const decodeToken_1 = require("../../utils/decodeToken");
const app_error_1 = require("../../core/errors/app.error");
const response_handler_1 = require("../../core/handlers/response.handler");
const http_status_code_1 = require("../../core/http/http.status.code");
const prisma_1 = require("../../DB/lib/prisma");
const global_types_1 = require("../../types/global.types");
class AuthService {
    constructor() { }
    // ============================ register ============================
    register = async (req, res, next) => {
        const { full_name, email, phone, password, image_url, lang, birth_date, gender, login_type, apple_id, type_id, national_id, synonyms, tax_card, commercial_register, } = req.body;
        // step: check user existence
        const isUserExist = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "User already exist");
        }
        // step: send email otp
        const otpCode = (0, createOtp_1.createOtp)();
        const { isEmailSended, info } = await (0, send_email_1.sendEmail)({
            to: email,
            subject: "Tawreedat",
            html: (0, generateHTML_1.template)({
                otpCode,
                receiverName: full_name,
                subject: "Confirm email",
            }),
        });
        if (!isEmailSended) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Error while sending email");
        }
        // step: get or create UserRole
        let role = await prisma_1.prisma.userRole.findFirst({
            where: { name: "Supplier" },
        });
        if (!role) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "No supplier role with name Supplier");
        }
        // step: get or create SupplierType
        let supplierType = await prisma_1.prisma.supplierType.findFirst();
        if (!supplierType) {
            supplierType = await prisma_1.prisma.supplierType.create({
                data: {
                    name: "Factory",
                    description: "Factory description",
                },
            });
        }
        // step: create User - Supplier - UserVerify
        const user = await prisma_1.prisma.user.create({
            data: {
                role_id: role.id,
                full_name,
                email,
                phone: phone ?? null,
                password: await (0, bcrypt_1.hash)(password),
                image_url: image_url ?? null,
                birth_date: birth_date ? new Date(birth_date) : null,
                gender: gender ?? global_types_1.GenderEnum.MALE,
                apple_id: apple_id ?? null,
                is_confirmed: false,
            },
        });
        const userVerify = await prisma_1.prisma.userVerify.create({
            data: {
                user_id: user.id,
                code: await (0, bcrypt_1.hash)(otpCode),
            },
        });
        const supplier = await prisma_1.prisma.supplier.create({
            data: {
                id: user.id,
                type_id: supplierType.id ?? null,
                national_id,
                synonyms: synonyms ?? null,
                tax_card,
                commercial_register,
            },
        });
        if (!user || !supplier) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "Creation failed");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: user.id, userEmail: user.email }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: user.id, userEmail: user.email }, process.env.REFRESH_SEGNATURE, {
            expiresIn: "7d",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "User created successfully",
            data: { accessToken, refreshToken, user },
            status: 201,
        });
    };
    // ============================ login ============================
    login = async (req, res, next) => {
        const { email, password } = req.body;
        // step: check credentials
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
        if (!user || !(await (0, bcrypt_1.compare)(password, user.password))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
        }
        // step: create token
        const accessToken = (0, jwt_1.createJwt)({ userId: user.id, userEmail: user.email }, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        const refreshToken = (0, jwt_1.createJwt)({ userId: user.id, userEmail: user.email }, process.env.REFRESH_SEGNATURE, {
            expiresIn: "7d",
            jwtid: (0, createOtp_1.createOtp)(),
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "تم تسجيل الدخول بنجاح",
            data: { accessToken, refreshToken, user },
        });
    };
    // ============================ refresh-token ============================
    refreshToken = async (req, res, next) => {
        const authorization = req.headers.authorization;
        // step: check authorization
        if (!authorization) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Authorization undefiend");
        }
        // step: decode authorization
        const { user, payload } = await (0, decodeToken_1.decodeToken)({
            authorization,
            tokenType: decodeToken_1.TokenTypesEnum.refresh,
        });
        // step: create accessToken
        const newPayload = {
            userId: payload.userId,
            userEmail: payload.userEmail,
        };
        const jwtid = (0, createOtp_1.createOtp)();
        // const jwtid = "666";
        const accessToken = (0, jwt_1.createJwt)(newPayload, process.env.ACCESS_SEGNATURE, {
            expiresIn: "1h",
            jwtid,
        });
        return (0, response_handler_1.responseHandler)({ res, data: { accessToken } });
    };
    // ============================ verifyEmail ============================
    verifyEmail = async (req, res, next) => {
        const { email, user_otp } = req.body;
        // step: check user and userVerify exitance
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "User not found");
        }
        const userVerify = await prisma_1.prisma.userVerify.findFirst({
            where: { user_id: user.id },
        });
        if (!userVerify) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "UserVerify of user not found");
        }
        // step: check user_otp
        if (!userVerify.code || !(await (0, bcrypt_1.compare)(user_otp, userVerify.code))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid otp");
        }
        // step: check if otp expired
        const otpTime = userVerify.updated_at ?? userVerify.created_at;
        if (otpTime.getTime() + 5 * 60 * 1000 < Date.now()) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "otp expired");
        }
        // step: check email confirmation
        if (!user.is_confirmed) {
            // step: case 1 user confirm main email
            const updatedUser = await prisma_1.prisma.user.update({
                where: { email },
                data: { is_confirmed: true },
            });
            return (0, response_handler_1.responseHandler)({ res, message: "Email confirmed successfully" });
        }
        else {
            // step: case 2 main email already confirmed and user confirm new email
            if (!userVerify.email) {
                throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "No new email to confirm");
            }
            const updatedUser = await prisma_1.prisma.user.update({
                where: { email },
                data: { email: userVerify.email },
            });
            return (0, response_handler_1.responseHandler)({
                res,
                message: "New email confirmed successfully",
            });
        }
    };
    // ============================ updateEmail ============================
    updateEmail = async (req, res, next) => {
        const user = res.locals.user;
        const { new_email } = req.body;
        // step: check if email confirmed
        if (!user.is_confirmed) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Please confirm email to update it");
        }
        // step: send otp to current email
        const otpCodeForCurrentEmail = (0, createOtp_1.createOtp)();
        const { isEmailSended } = await (0, send_email_1.sendEmail)({
            to: user.email,
            subject: "TawreedatApp",
            html: (0, generateHTML_1.template)({
                otpCode: otpCodeForCurrentEmail,
                receiverName: user.full_name,
                subject: "Some one try to change your email! is that you?",
            }),
        });
        if (!isEmailSended) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Error while checking email");
        }
        // step: save otp and new_email
        const isUserVerifyExist = await prisma_1.prisma.userVerify.findFirst({
            where: { user_id: user.id },
        });
        let updatedUserVerify = null;
        if (isUserVerifyExist) {
            updatedUserVerify = await prisma_1.prisma.userVerify.update({
                where: { id: isUserVerifyExist.id },
                data: {
                    code: await (0, bcrypt_1.hash)(otpCodeForCurrentEmail),
                    email: new_email,
                },
            });
        }
        else {
            updatedUserVerify = await prisma_1.prisma.userVerify.create({
                data: {
                    user_id: user.id,
                    email: new_email,
                    code: await (0, bcrypt_1.hash)(otpCodeForCurrentEmail),
                },
            });
        }
        return (0, response_handler_1.responseHandler)({
            res,
            message: "OTP sended for current email successfully",
        });
    };
    // ============================ resendOtp ============================
    resendOtp = async (req, res, next) => {
        const { email } = req.body;
        // step: check email existence
        const isUserExist = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        const userVerify = await prisma_1.prisma.userVerify.findFirst({
            where: { user_id: user.id },
        });
        if (!userVerify) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "UserVerify of user not found");
        }
        // step: check if otp not expired yet
        const otpTime = userVerify.updated_at ?? userVerify.created_at;
        if (otpTime.getTime() + 5 * 60 * 1000 > Date.now()) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Your OTP not expired yet");
        }
        // step: send email otp
        const otpCode = (0, createOtp_1.createOtp)();
        const { isEmailSended, info } = await (0, send_email_1.sendEmail)({
            to: email,
            subject: "TawreedatApp",
            html: (0, generateHTML_1.template)({
                otpCode,
                receiverName: user.full_name,
                subject: "Confirm email",
            }),
        });
        if (!isEmailSended) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Error while sending email");
        }
        // step: update email_otp
        const updatedUserVerify = await prisma_1.prisma.userVerify.update({
            where: { id: userVerify.id },
            data: {
                code: await (0, bcrypt_1.hash)(otpCode),
            },
        });
        return (0, response_handler_1.responseHandler)({ res, message: "OTP sended successfully" });
    };
    // ============================ updatePassword ============================
    updatePassword = async (req, res, next) => {
        const user = res.locals.user;
        const { current_password, new_password } = req.body;
        // step: check password correction
        if (!(await (0, bcrypt_1.compare)(current_password, user.password))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
        }
        // step: check new_password not equal current_password
        if (await (0, bcrypt_1.compare)(new_password, user.password)) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "You can not make new password equal to old password");
        }
        // step: update password and password_last_updated
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                password: await (0, bcrypt_1.hash)(new_password),
                password_last_updated: new Date(Date.now()),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Password updated successfully, please login again",
        });
    };
    // ============================ forgetPassword ============================
    forgetPassword = async (req, res, next) => {
        const { email } = req.body;
        // step: check email existence
        const isUserExist = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        const userVerify = await prisma_1.prisma.userVerify.findFirst({
            where: { user_id: user.id },
        });
        if (!userVerify) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "UserVerify of user not found");
        }
        // step: check if otp not expired yet
        const otpTime = userVerify.updated_at ?? userVerify.created_at;
        if (otpTime.getTime() + 5 * 60 * 1000 > Date.now()) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Your OTP not expired yet");
        }
        // step: send email otp
        const otpCode = (0, createOtp_1.createOtp)();
        const { isEmailSended, info } = await (0, send_email_1.sendEmail)({
            to: user?.email,
            subject: "Reset password OTP",
            html: (0, generateHTML_1.template)({
                otpCode,
                receiverName: user.full_name,
                subject: "Reset password OTP",
            }),
        });
        if (!isEmailSended) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Error while sending email");
        }
        // step: update password_otp
        const updatedUserVerify = await prisma_1.prisma.userVerify.update({
            where: { id: userVerify.id },
            data: {
                code: await (0, bcrypt_1.hash)(otpCode),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "OTP sended to email, please use it to restart your password",
        });
    };
    // ============================ changePassword ============================
    changePassword = async (req, res, next) => {
        const { email, user_otp, new_password } = req.body;
        // step: check email existence
        const isUserExist = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        const userVerify = await prisma_1.prisma.userVerify.findFirst({
            where: { user_id: user.id },
        });
        if (!userVerify) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.INTERNAL_SERVER_ERROR, "UserVerify of user not found");
        }
        // step: check user_otp
        if (!userVerify.code || !(await (0, bcrypt_1.compare)(user_otp, userVerify.code))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid otp");
        }
        // step: check if otp expired
        const otpTime = userVerify.updated_at ?? userVerify.created_at;
        if (otpTime.getTime() + 5 * 60 * 1000 < Date.now()) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "otp expired");
        }
        // step: change password
        const updatedUser = await prisma_1.prisma.user.update({
            where: { email },
            data: {
                password: await (0, bcrypt_1.hash)(new_password),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Password changed successfully, You have to login",
        });
    };
    // ============================ logout ============================
    logout = async (req, res, next) => {
        const user = res.locals.user;
        // step: change password_last_updated
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password_last_updated: new Date(Date.now()) },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Logged out successfully",
        });
    };
}
exports.AuthService = AuthService;
