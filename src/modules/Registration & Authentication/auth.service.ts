import { Language, LoginType, Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import {
  appleLoginDTO,
  changePasswordDTO,
  verifyEmaiDTO,
  forgetPasswordDTO,
  googleLoginDTO,
  loginDTO,
  registerDTO,
  resendOtpDTO,
  updateEmaiDTO,
  updatePasswordDTO,
} from "./auth.dto";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { OAuth2Client } from "google-auth-library";
import { template } from "../../utils/sendEmail/generateHTML";
import { createJwt } from "../../utils/jwt";
import { createOtp } from "../../utils/createOtp";
import { compare, hash } from "../../utils/bcrypt";
import { sendEmail } from "../../utils/sendEmail/send.email";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";
import { IAuthServcie } from "../../types/global.interfaces";
import { AppError } from "../../core/errors/app.error";
import { responseHandler } from "../../core/handlers/response.handler";
import { HttpStatusCode } from "../../core/http/http.status.code";
import { prisma } from "../../DB/lib/prisma";
import { GenderEnum } from "../../types/global.types";
export class AuthService implements IAuthServcie {
  constructor() {}

  // ============================ register ============================
  register = async (req: Request, res: Response, next: NextFunction) => {
    const {
      full_name,
      email,
      phone,
      password,
      lang,
      birth_date,
      gender,
      login_type,
      apple_id,
      type_id,
      national_id,
      synonyms,
      tax_card,
      commercial_register,
    }: registerDTO = req.body;
    // step: check user existence
    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (isUserExist) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "User already exist");
    }
    // step: send email otp
    const otpCode = createOtp();
    const { isEmailSended, info } = await sendEmail({
      to: email,
      subject: "Tawreedat",
      html: template({
        otpCode,
        receiverName: full_name,
        subject: "Confirm email",
      }),
    });
    if (!isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while sending email",
      );
    }
    // step: get or create UserRole
    let role = await prisma.userRole.findFirst({
      where: { name: "Supplier" },
    });

    if (!role) {
      // role = await prisma.userRole.create({
      //   data: {
      //     name: "Supplier",
      //     description: "Supplier role description",
      //   },
      // });
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Supplier role not founded in db",
      );
    }
    // step: get or create SupplierType
    let supplierType = await prisma.supplierType.findFirst();
    if (!supplierType) {
      supplierType = await prisma.supplierType.create({
        data: {
          name: "Factory",
          description: "Factory description",
        },
      });
    }

    // step: create User - Supplier - UserVerify
    const user = await prisma.user.create({
      data: {
        role_id: role.id,
        full_name,
        email,
        phone: phone ?? null,
        password: await hash(password),
        lang: (lang as Language) ?? Language.AR,
        birth_date: birth_date ? new Date(birth_date) : null,
        gender: gender ?? GenderEnum.MALE,
        apple_id: apple_id ?? null,
        is_confirmed: false,
      },
    });
    const userVerify = await prisma.userVerify.create({
      data: {
        user_id: user.id,
        code: await hash(otpCode),
      },
    });
    const supplier = await prisma.supplier.create({
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
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Creation failed",
      );
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      },
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      },
    );
    return responseHandler({
      res,
      message: "User created successfully",
      data: { accessToken, refreshToken, user },
      status: 201,
    });
  };

  // ============================ login ============================
  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: loginDTO = req.body;
    // step: check credentials
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user || !(await compare(password, user.password as string))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    // step: update last_login_at
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { last_login_at: Date.now().toString() },
    });
    // step: create token
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      },
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      },
    );
    return responseHandler({
      res,
      message: "تم تسجيل الدخول بنجاح",
      data: { accessToken, refreshToken, user },
    });
  };

  // ============================ googleLogin ============================
  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { id_token }: googleLoginDTO = req.body;
    // step: verify Google token
    const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_WEB_CLIENT_ID as string,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid Google token");
    }
    if (!payload || !payload.email) {
      throw new AppError(
        HttpStatusCode.UNAUTHORIZED,
        "Invalid Google token payload",
      );
    }
    const { email, name } = payload;
    // step: find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) {
      // step: get UserRole
      let role = await prisma.userRole.findFirst({
        where: { name: "Supplier" },
      });
      if (!role) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          "Supplier role not founded in db",
        );
      }
      // step: get SupplierType
      let supplierType = await prisma.supplierType.findFirst();
      if (!supplierType) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          "Supplier type not founded in db",
        );
      }
      // step: create user with Google login
      const newUser = await prisma.user.create({
        data: {
          role_id: role.id,
          full_name: name ?? "Google User",
          email,
          login_type: LoginType.GOOGLE,
          is_confirmed: true, // Google accounts are pre-verified
          lang: Language.AR,
        },
        include: { role: true },
      });
      // step: create supplier record
      await prisma.supplier.create({
        data: {
          id: newUser.id,
          type_id: supplierType.id,
          national_id: "",
          tax_card: "",
          commercial_register: "",
        },
      });
      user = newUser;
    } else {
      // step: update login_type to GOOGLE if currently LOCAL
      if (user.login_type === LoginType.LOCAL) {
        user = await prisma.user.update({
          where: { email },
          data: { login_type: LoginType.GOOGLE },
          include: { role: true },
        });
      }
    }
    // step: update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: Date.now().toString() },
    });
    // step: create tokens
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      },
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      },
    );
    return responseHandler({
      res,
      message: "Google login successful",
      data: { accessToken, refreshToken, user },
    });
  };

  // ============================ appleLogin ============================
  appleLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { id_token, user: appleUser }: appleLoginDTO = req.body;

    // step: verify Apple token and extract payload
    let payload: any;
    try {
      // Apple's public keys endpoint
      const client = jwksClient({
        jwksUri: "https://appleid.apple.com/auth/keys",
        cache: true,
        rateLimit: true,
      });

      // Decode token header to get key ID
      const decodedHeader = jwt.decode(id_token, { complete: true }) as {
        header: { kid: string; alg: string };
        payload: any;
      };

      if (!decodedHeader || !decodedHeader.header) {
        throw new Error("Invalid token structure");
      }

      // Get the signing key from Apple
      const key = await client.getSigningKey(decodedHeader.header.kid);
      const signingKey = key.getPublicKey();

      // Verify the token
      payload = jwt.verify(id_token, signingKey, {
        algorithms: ["RS256"],
        issuer: "https://appleid.apple.com",
      }) as {
        sub: string; // Apple's unique user ID
        email?: string;
        email_verified?: string | boolean;
        aud: string;
        exp: number;
        iat: number;
      };
    } catch (error) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid Apple token");
    }

    // step: extract email - from token payload or from user object (first sign-in only)
    const email = payload.email || appleUser?.email;
    const appleUserId = payload.sub;

    if (!email) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Email not provided. Please share your email when signing in with Apple.",
      );
    }

    // step: find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { apple_id: appleUserId }],
      },
      include: { role: true },
    });

    if (!user) {
      // step: get UserRole
      let role = await prisma.userRole.findFirst({
        where: { name: "Supplier" },
      });
      if (!role) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          "Supplier role not founded in db",
        );
      }

      // step: get SupplierType
      let supplierType = await prisma.supplierType.findFirst();
      if (!supplierType) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          "Supplier type not founded in db",
        );
      }

      // step: construct full name from Apple user info
      let fullName = "Apple User";
      if (appleUser?.name) {
        const firstName = appleUser.name.firstName || "";
        const lastName = appleUser.name.lastName || "";
        fullName = `${firstName} ${lastName}`.trim() || "Apple User";
      }

      // step: create user with Apple login
      const newUser = await prisma.user.create({
        data: {
          role_id: role.id,
          full_name: fullName,
          email,
          apple_id: appleUserId,
          login_type: LoginType.APPLE,
          is_confirmed: true, // Apple accounts are pre-verified
          lang: Language.AR,
        },
        include: { role: true },
      });

      // step: create supplier record
      await prisma.supplier.create({
        data: {
          id: newUser.id,
          type_id: supplierType.id,
          national_id: "",
          tax_card: "",
          commercial_register: "",
        },
      });

      user = newUser;
    } else {
      // step: update apple_id if not set and update login_type to APPLE
      if (!user.apple_id || user.login_type !== LoginType.APPLE) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            apple_id: appleUserId,
            login_type: LoginType.APPLE,
          },
          include: { role: true },
        });
      }
    }

    // step: update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: Date.now().toString() },
    });

    // step: create tokens
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      },
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      },
    );

    return responseHandler({
      res,
      message: "Apple login successful",
      data: { accessToken, refreshToken, user },
    });
  };

  // ============================ getSupplierTypes ============================
  getSupplierTypes = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const supplierTypes = await prisma.supplierType.findMany({
      where: { deleted_at: null },
    });
    return responseHandler({
      res,
      message: "Supplier types fetched successfully",
      data: supplierTypes,
    });
  };

  // ============================ refresh-token ============================
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    // step: check authorization
    if (!authorization) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Authorization undefiend");
    }
    // step: decode authorization
    const { user, payload } = await decodeToken({
      authorization,
      tokenType: TokenTypesEnum.refresh,
    });
    // step: create accessToken
    const newPayload = {
      userId: payload.userId,
      userEmail: payload.userEmail,
    };
    const jwtid = createOtp();
    // const jwtid = "666";
    const accessToken = createJwt(
      newPayload,
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid,
      },
    );
    return responseHandler({ res, data: { accessToken } });
  };

  // ============================ verifyEmail ============================
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, user_otp }: verifyEmaiDTO = req.body;
    // step: check user and userVerify exitance
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "User not found");
    }
    const userVerify = await prisma.userVerify.findFirst({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found",
      );
    }
    // step: check user_otp
    if (!userVerify.code || !(await compare(user_otp, userVerify.code))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid otp");
    }
    // step: check if otp expired
    const otpTime = userVerify.updated_at ?? userVerify.created_at;
    if (otpTime.getTime() + 5 * 60 * 1000 < Date.now()) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "otp expired");
    }
    // step: check email confirmation
    if (!user.is_confirmed) {
      // step: case 1 user confirm main email
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { is_confirmed: true },
      });
      return responseHandler({ res, message: "Email confirmed successfully" });
    } else {
      // step: case 2 main email already confirmed and user confirm new email
      if (!userVerify.email) {
        throw new AppError(
          HttpStatusCode.BAD_REQUEST,
          "No new email to confirm",
        );
      }
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { email: userVerify.email },
      });
      return responseHandler({
        res,
        message: "New email confirmed successfully",
      });
    }
  };

  // ============================ updateEmail ============================
  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { new_email }: updateEmaiDTO = req.body;
    // step: check if email confirmed
    if (!user.is_confirmed) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Please confirm email to update it",
      );
    }
    // step: check if new_email is same current email
    if (new_email == user.email) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "You are trying to update to the same email, please enter a new email!",
      );
    }
    // step: send otp to current email
    const otpCodeForCurrentEmail = createOtp();
    const { isEmailSended } = await sendEmail({
      to: user.email,
      subject: "TawreedatApp",
      html: template({
        otpCode: otpCodeForCurrentEmail,
        receiverName: user.full_name,
        subject: "Some one try to change your email! is that you?",
      }),
    });
    if (!isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while checking email",
      );
    }
    // step: save otp and new_email
    const isUserVerifyExist = await prisma.userVerify.findFirst({
      where: { user_id: user.id },
    });
    let updatedUserVerify = null;
    if (isUserVerifyExist) {
      updatedUserVerify = await prisma.userVerify.update({
        where: { id: isUserVerifyExist.id },
        data: {
          code: await hash(otpCodeForCurrentEmail),
          email: new_email,
        },
      });
    } else {
      updatedUserVerify = await prisma.userVerify.create({
        data: {
          user_id: user.id,
          email: new_email,
          code: await hash(otpCodeForCurrentEmail),
        },
      });
    }
    return responseHandler({
      res,
      message: "OTP sended for current email successfully",
    });
  };

  // ============================ resendOtp ============================
  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: resendOtpDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    const userVerify = await prisma.userVerify.findFirst({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found",
      );
    }
    // step: check if otp not expired yet
    const otpTime = userVerify.updated_at ?? userVerify.created_at;
    if (otpTime.getTime() + 5 * 60 * 1000 > Date.now()) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet",
      );
    }
    // step: send email otp
    const otpCode = createOtp();
    const { isEmailSended, info } = await sendEmail({
      to: email,
      subject: "TawreedatApp",
      html: template({
        otpCode,
        receiverName: user.full_name,
        subject: "Confirm email",
      }),
    });
    if (!isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while sending email",
      );
    }
    // step: update email_otp
    const updatedUserVerify = await prisma.userVerify.update({
      where: { id: userVerify.id },
      data: {
        code: await hash(otpCode),
      },
    });
    return responseHandler({ res, message: "OTP sended successfully" });
  };

  // ============================ updatePassword ============================
  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { current_password, new_password }: updatePasswordDTO = req.body;
    // step: check password correction
    if (!(await compare(current_password, user.password))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    // step: check new_password not equal current_password
    if (await compare(new_password, user.password)) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "You can not make new password equal to old password",
      );
    }
    // step: update password and password_last_updated
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hash(new_password),
        password_last_updated: new Date(Date.now()),
      },
    });
    return responseHandler({
      res,
      message: "Password updated successfully, please login again",
    });
  };

  // ============================ forgetPassword ============================
  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: forgetPasswordDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    const userVerify = await prisma.userVerify.findFirst({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found",
      );
    }
    // step: check if otp not expired yet
    const otpTime = userVerify.updated_at ?? userVerify.created_at;
    if (otpTime.getTime() + 5 * 60 * 1000 > Date.now()) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet",
      );
    }
    // step: send email otp
    const otpCode = createOtp();
    const { isEmailSended, info } = await sendEmail({
      to: user?.email as string,
      subject: "Reset password OTP",
      html: template({
        otpCode,
        receiverName: user.full_name,
        subject: "Reset password OTP",
      }),
    });
    if (!isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while sending email",
      );
    }
    // step: update password_otp
    const updatedUserVerify = await prisma.userVerify.update({
      where: { id: userVerify.id },
      data: {
        code: await hash(otpCode),
      },
    });
    return responseHandler({
      res,
      message: "OTP sended to email, please use it to restart your password",
    });
  };

  // ============================ changePassword ============================
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, user_otp, new_password }: changePasswordDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    const userVerify = await prisma.userVerify.findFirst({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found",
      );
    }
    // step: check user_otp
    if (!userVerify.code || !(await compare(user_otp, userVerify.code))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid otp");
    }
    // step: check if otp expired
    const otpTime = userVerify.updated_at ?? userVerify.created_at;
    if (otpTime.getTime() + 5 * 60 * 1000 < Date.now()) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "otp expired");
    }
    // step: change password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: await hash(new_password),
      },
    });
    return responseHandler({
      res,
      message: "Password changed successfully, You have to login",
    });
  };

  // ============================ logout ============================
  logout = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    // step: change password_last_updated
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password_last_updated: new Date(Date.now()) },
    });
    return responseHandler({
      res,
      message: "Logged out successfully",
    });
  };
}
