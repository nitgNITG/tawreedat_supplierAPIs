import { NextFunction, Request, Response } from "express";
import {
  changePasswordDTO,
  verifyEmaiDTO,
  forgetPasswordDTO,
  loginDTO,
  registerDTO,
  resendOtpDTO,
  updateEmaiDTO,
  updatePasswordDTO,
} from "./auth.dto";
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
      image_url,
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
        "Error while sending email"
      );
    }
    // step: get or create UserRole
    let role = await prisma.userRole.findFirst({
      where: { name: "Supplier" },
    });

    if (!role) {
      role = await prisma.userRole.create({
        data: {
          name: "Supplier",
          description: "Supplier role description",
        },
      });
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
        image_url: image_url ?? null,
        lang: lang ?? null,
        birth_date: birth_date ? new Date(birth_date) : null,
        gender: gender ?? GenderEnum.MALE,
        login_type: login_type ?? null,
        apple_id: apple_id ?? null,
      },
    });
    const userVerify = await prisma.userVerify.create({
      data: {
        user_id: user.id,
        email_otp: await hash(otpCode),
        email_otp_expired_at: new Date(Date.now() + 5 * 60 * 1000),
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
        "Creation failed"
      );
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      }
    );
    return responseHandler({
      res,
      message: "User created successfully",
      data: { accessToken, refreshToken },
      status: 201,
    });
  };

  // ============================ login ============================
  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: loginDTO = req.body;
    // step: check credentials
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await compare(password, user.password))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user.id, userEmail: user.email },
      process.env.REFRESH_SEGNATURE as string,
      {
        expiresIn: "7d",
        jwtid: createOtp(),
      }
    );
    return responseHandler({
      res,
      message: "Loggedin successfully",
      data: { accessToken, refreshToken },
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
      }
    );
    return responseHandler({ res, data: { accessToken } });
  };

  // ============================ verifyEmail ============================
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstOtp, secondOtp }: verifyEmaiDTO = req.body;
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
        "UserVerify of user not found"
      );
    }
    // step: check email_otp
    if (
      !userVerify.email_otp ||
      !(await compare(firstOtp, userVerify.email_otp))
    ) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid otp");
    }
    if (
      userVerify.email_otp_expired_at &&
      userVerify.email_otp_expired_at < new Date(Date.now())
    ) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "otp expired");
    }
    // step: case 1 email not confrimed (confirm first email)
    if (!user.is_confirmed) {
      // step: confirm email
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { is_confirmed: true },
      });
      return responseHandler({ res, message: "Email confirmed successfully" });
    }
    // step: case 2 email confrimed (confirm first and second email)
    // step: check secondOtp existence
    if (!secondOtp) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Email already confirmed, if you want to update email please send firstOtp and secondOtp"
      );
    }
    // step: check new_email_otp
    if (
      !userVerify.new_email_otp ||
      !(await compare(secondOtp, userVerify.new_email_otp))
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Invalid otp for second email"
      );
    }
    if (
      userVerify.new_email_otp_expired_at &&
      userVerify.new_email_otp_expired_at < new Date(Date.now())
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "otp expired for second email"
      );
    }
    // step: confirm email
    const newEmail = userVerify.new_email;
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { email: newEmail as string },
    });
    return responseHandler({
      res,
      message: "New email confirmed successfully",
    });
  };

  // ============================ updateEmail ============================
  updateEmail = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { new_email }: updateEmaiDTO = req.body;
    // step: check if email confirmed
    if (!user.is_confirmed) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Please confirm email to update it"
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
        "Error while checking email"
      );
    }
    // step: send otp to new email
    const otpCodeForNewEmail = createOtp();
    const resultOfSendEmail = await sendEmail({
      to: new_email,
      subject: "TawreedatApp",
      html: template({
        otpCode: otpCodeForNewEmail,
        receiverName: user.full_name,
        subject: "Confirm new email",
      }),
    });
    if (!resultOfSendEmail.isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while checking email"
      );
    }
    // step: save email_otp, new_email and new_email_otp
    const updatedUserVerify = await prisma.userVerify.update({
      where: { user_id: user.id },
      data: {
        email_otp: await hash(otpCodeForCurrentEmail),
        email_otp_expired_at: new Date(Date.now() + 5 * 60 * 1000),
        new_email: new_email,
        new_email_otp: await hash(otpCodeForNewEmail),
        new_email_otp_expired_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return responseHandler({
      res,
      message:
        "OTP sended for current email and new email, please confirm new email to save updates",
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
        "UserVerify of user not found"
      );
    }
    // step: check if email otp not expired yet
    if (
      userVerify?.email_otp_expired_at &&
      userVerify?.email_otp_expired_at > new Date(Date.now())
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet"
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
        "Error while sending email"
      );
    }
    // step: update email_otp
    const updatedUserVerify = await prisma.userVerify.update({
      where: { user_id: user.id },
      data: {
        email_otp: await hash(otpCode),
        email_otp_expired_at: new Date(Date.now() + 5 * 60 * 1000),
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
        "You can not make new password equal to old password"
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
    const userVerify = await prisma.userVerify.findUnique({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found"
      );
    }
    // step: check if password otp not expired yet
    if (
      userVerify.password_otp_expired_at &&
      userVerify.password_otp_expired_at > new Date(Date.now())
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet"
      );
    }
    // step: send email otp
    const otpCode = createOtp();
    const { isEmailSended, info } = await sendEmail({
      to: user.email,
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
        "Error while sending email"
      );
    }
    // step: update password_otp
    const updatedUserVerify = await prisma.userVerify.update({
      where: { user_id: user.id },
      data: {
        password_otp: await hash(otpCode),
        password_otp_expired_at: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return responseHandler({
      res,
      message: "OTP sended to email, please use it to restart your password",
    });
  };

  // ============================ changePassword ============================
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, new_password }: changePasswordDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    const userVerify = await prisma.userVerify.findUnique({
      where: { user_id: user.id },
    });
    if (!userVerify) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "UserVerify of user not found"
      );
    }
    // step: check otp
    if (!(await compare(otp, userVerify.password_otp as string))) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid OTP");
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
