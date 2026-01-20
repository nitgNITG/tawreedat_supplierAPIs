"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.TokenTypesEnum = void 0;
const jwt_1 = require("./jwt");
const app_error_1 = require("../core/errors/app.error");
const http_status_code_1 = require("../core/http/http.status.code");
const prisma_1 = require("../DB/lib/prisma");
var TokenTypesEnum;
(function (TokenTypesEnum) {
    TokenTypesEnum["access"] = "access";
    TokenTypesEnum["refresh"] = "refresh";
})(TokenTypesEnum || (exports.TokenTypesEnum = TokenTypesEnum = {}));
const decodeToken = async ({ authorization, tokenType = TokenTypesEnum.access, }) => {
    // step: bearer key
    if (!authorization.startsWith(process.env.BEARER_KEY)) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Invalid bearer key");
    }
    // step: token validation
    let [bearer, token] = authorization.split(" ");
    // step: check authorization existence
    if (!token || token == null) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "Invalid authorization");
    }
    let privateKey = "";
    if (tokenType == TokenTypesEnum.access) {
        privateKey = process.env.ACCESS_SEGNATURE;
    }
    else if (tokenType == TokenTypesEnum.refresh) {
        privateKey = process.env.REFRESH_SEGNATURE;
    }
    let payload = (0, jwt_1.verifyJwt)({ token, privateKey }); // result || error
    // step: user existence
    const user = await prisma_1.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "User not found");
    }
    // step: supplier existence
    const supplier = await prisma_1.prisma.supplier.findUnique({
        where: { id: payload.userId },
    });
    if (!supplier) {
        throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.NOT_FOUND, "Supplier not found");
    }
    // step: credentials changing
    if (user.password_last_updated) {
        if (user.password_last_updated.getTime() > payload.iat * 1000) {
            throw new app_error_1.AppError(http_status_code_1.HttpStatusCode.BAD_REQUEST, "You have to login");
        }
    }
    // step: return user & payload
    return { user, payload };
};
exports.decodeToken = decodeToken;
