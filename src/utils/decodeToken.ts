import { NextFunction } from "express";
import { UserModel } from "../modules/user/user.model";
import { MyJwtPayload, verifyJwt } from "./jwt";
import { HydratedDocument } from "mongoose";
import { IUser } from "../types/global.interfaces";
import { AppError } from "../core/errors/app.error";
import { HttpStatusCode } from "../core/http/http.status.code";

export enum TokenTypesEnum {
  access = "access",
  refresh = "refresh",
}

const userModel = UserModel;

export const decodeToken = async ({
  authorization,
  tokenType = TokenTypesEnum.access,
}: {
  authorization: string;
  tokenType?: TokenTypesEnum;
}): Promise<{ user: HydratedDocument<IUser>; payload: MyJwtPayload }> => {
  // step: bearer key
  if (!authorization.startsWith(process.env.BEARER_KEY as string)) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid bearer key");
  }
  // step: token validation
  let [bearer, token] = authorization.split(" ");
  // step: check authorization existence
  if (!token || token == null) {
    throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid authorization");
  }
  let privateKey = "";
  if (tokenType == TokenTypesEnum.access) {
    privateKey = process.env.ACCESS_SEGNATURE as string;
  } else if (tokenType == TokenTypesEnum.refresh) {
    privateKey = process.env.REFRESH_SEGNATURE as string;
  }
  let payload = verifyJwt({ token, privateKey }); // result || error
  // step: user existence
  const user = await userModel.findOne({ _id: payload.userId });
  if (!user) {
    throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
  }
  // step: credentials changing
  if (user.credentialsChangedAt) {
    if (user.credentialsChangedAt.getTime() > payload.iat * 1000) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "You have to login");
    }
  }
  // step: return user & payload
  return { user, payload };
};
