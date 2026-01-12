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
        const { full_name, email, phone, password, image_url, lang, birth_date, gender, login_type, apple_id, type_id, national_id, synonyms, taxCard, commercial_register, } = req.body;
        // step: check user existence
        const isUserExist = await prisma_1.prisma.users.findUnique({ where: { email } });
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
        // step: get or create supplier role
        let role = await prisma_1.prisma.userRoles.findFirst({
            where: { name: "Supplier" },
        });
        if (!role) {
            role = await prisma_1.prisma.userRoles.create({
                data: {
                    name: "Supplier",
                    description: "Supplier role description",
                },
            });
        }
        // step: get or create supplier type
        let supplierType = await prisma_1.prisma.supplierTypes.findFirst();
        if (!supplierType) {
            supplierType = await prisma_1.prisma.supplierTypes.create({
                data: {
                    name: "Factory",
                    description: "Factory description",
                },
            });
        }
        // step: create new user and supplier
        const user = await prisma_1.prisma.users.create({
            data: {
                role_id: role.id,
                full_name,
                email,
                phone: phone ?? null,
                password: await (0, bcrypt_1.hash)(password),
                image_url: image_url ?? null,
                lang: lang ?? null,
                birth_date: birth_date ? new Date(birth_date) : null,
                gender: gender ?? global_types_1.GenderEnum.MALE,
                login_type: login_type ?? null,
                apple_id: apple_id ?? null,
                emailOtp: await (0, bcrypt_1.hash)(otpCode),
                emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        const supplier = await prisma_1.prisma.suppliers.create({
            data: {
                id: user.id,
                type_id: supplierType.id ?? null,
                national_id,
                synonyms: synonyms ?? null,
                taxCard,
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
            data: { accessToken, refreshToken },
            status: 201,
        });
    };
    // ============================ login ============================
    login = async (req, res, next) => {
        const { email, password } = req.body;
        // step: check credentials
        const user = await prisma_1.prisma.users.findUnique({ where: { email } });
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
            message: "Loggedin successfully",
            data: { accessToken, refreshToken },
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
    // ============================ confirmEmail ============================
    confirmEmail = async (req, res, next) => {
        const { email, firstOtp, secondOtp } = req.body;
        // step: check user exitance
        const user = await prisma_1.prisma.users.findUnique({ where: { email } });
        if (!user) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "User not found");
        }
        // step: check emailOtp
        if (!user.emailOtp || !(await (0, bcrypt_1.compare)(firstOtp, user.emailOtp))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid otp");
        }
        if (user.emailOtp_expiredAt &&
            user.emailOtp_expiredAt < new Date(Date.now())) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "otp expired");
        }
        // step: case 1 email not confrimed (confirm first email)
        if (!user.is_confirmed) {
            // step: confirm email
            const updatedUser = await prisma_1.prisma.users.update({
                where: { email },
                data: { is_confirmed: true },
            });
            return (0, response_handler_1.responseHandler)({ res, message: "Email confirmed successfully" });
        }
        // step: case 2 email confrimed (confirm first and second email)
        // step: check secondOtp existence
        if (!secondOtp) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Email already confirmed, if you want to update email please send firstOtp and secondOtp");
        }
        // step: check newEmailOtp
        if (!user.newEmailOtp || !(await (0, bcrypt_1.compare)(secondOtp, user.newEmailOtp))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Invalid otp for second email");
        }
        if (user.newEmailOtp_expiredAt &&
            user.newEmailOtp_expiredAt < new Date(Date.now())) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "otp expired for second email");
        }
        // step: confirm email
        const newEmail = user.newEmail;
        const updatedUser = await prisma_1.prisma.users.update({
            where: { email },
            data: { email: newEmail },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "New email confirmed successfully",
        });
    };
    // ============================ updateEmail ============================
    updateEmail = async (req, res, next) => {
        const user = res.locals.user;
        const { newEmail } = req.body;
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
        // step: send otp to new email
        const otpCodeForNewEmail = (0, createOtp_1.createOtp)();
        const resultOfSendEmail = await (0, send_email_1.sendEmail)({
            to: newEmail,
            subject: "TawreedatApp",
            html: (0, generateHTML_1.template)({
                otpCode: otpCodeForNewEmail,
                receiverName: user.full_name,
                subject: "Confirm new email",
            }),
        });
        if (!resultOfSendEmail.isEmailSended) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Error while checking email");
        }
        // step: save emailOtp, newEmail and newEmailOtp
        const updatedUser = await prisma_1.prisma.users.update({
            where: { id: user.id },
            data: {
                emailOtp: await (0, bcrypt_1.hash)(otpCodeForCurrentEmail),
                emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
                newEmail,
                newEmailOtp: await (0, bcrypt_1.hash)(otpCodeForNewEmail),
                newEmailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "OTP sended for current email and new email, please confirm new email to save updates",
        });
    };
    // ============================ resendEmailOtp ============================
    resendEmailOtp = async (req, res, next) => {
        const { email } = req.body;
        // step: check email existence
        const isUserExist = await prisma_1.prisma.users.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        // step: check if email otp not expired yet
        if (user.emailOtp_expiredAt &&
            user.emailOtp_expiredAt > new Date(Date.now())) {
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
        // step: update emailOtp
        const updatedUser = await prisma_1.prisma.users.update({
            where: { email: user.email },
            data: {
                emailOtp: await (0, bcrypt_1.hash)(otpCode),
                emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        return (0, response_handler_1.responseHandler)({ res, message: "OTP sended successfully" });
    };
    // ============================ updatePassword ============================
    updatePassword = async (req, res, next) => {
        const user = res.locals.user;
        const { currentPassword, newPassword } = req.body;
        // step: check password correction
        if (!(await (0, bcrypt_1.compare)(currentPassword, user.password))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
        }
        // step: check newPassword not equal currentPassword
        if (await (0, bcrypt_1.compare)(newPassword, user.password)) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "You can not make new password equal to old password");
        }
        // step: update password and credentialsChangedAt
        const updatedUser = await prisma_1.prisma.users.update({
            where: { id: user.id },
            data: {
                password: await (0, bcrypt_1.hash)(newPassword),
                credentialsChangedAt: new Date(Date.now()),
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
        const isUserExist = await prisma_1.prisma.users.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        // step: check if password otp not expired yet
        if (user.passwordOtp_expiredAt &&
            user.passwordOtp_expiredAt > new Date(Date.now())) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Your OTP not expired yet");
        }
        // step: send email otp
        const otpCode = (0, createOtp_1.createOtp)();
        const { isEmailSended, info } = await (0, send_email_1.sendEmail)({
            to: user.email,
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
        // step: update passwordOtp
        const updatedUser = await prisma_1.prisma.users.update({
            where: { id: user.id },
            data: {
                passwordOtp: await (0, bcrypt_1.hash)(otpCode),
                passwordOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "OTP sended to email, please use it to restart your password",
        });
    };
    // ============================ changePassword ============================
    changePassword = async (req, res, next) => {
        const { email, otp, newPassword } = req.body;
        // step: check email existence
        const isUserExist = await prisma_1.prisma.users.findUnique({ where: { email } });
        if (!isUserExist) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
        }
        const user = isUserExist;
        // step: check otp
        if (!(await (0, bcrypt_1.compare)(otp, user.passwordOtp))) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Invalid OTP");
        }
        // step: change password
        const updatedUser = await prisma_1.prisma.users.update({
            where: { email },
            data: {
                password: await (0, bcrypt_1.hash)(newPassword),
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
        // step: change credentialsChangedAt
        const updatedUser = await prisma_1.prisma.users.update({
            where: { id: user.id },
            data: { credentialsChangedAt: new Date(Date.now()) },
        });
        return (0, response_handler_1.responseHandler)({
            res,
            message: "Logged out successfully",
        });
    };
}
exports.AuthService = AuthService;
