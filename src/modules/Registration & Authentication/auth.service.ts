import { NextFunction, Request, Response } from "express";
import {
  changePasswordDTO,
  confirmEmaiDTO,
  forgetPasswordDTO,
  loginDTO,
  registerDTO,
  resendEmailOtpDTO,
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
      taxCard,
      commercial_register,
    }: registerDTO = req.body;
    // step: check user existence
    const isUserExist = await prisma.users.findUnique({ where: { email } });
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
    // step: get or create supplier role
    let role = await prisma.userRoles.findFirst({
      where: { name: "Supplier" },
    });

    if (!role) {
      role = await prisma.userRoles.create({
        data: {
          name: "Supplier",
          description: "Supplier role description",
        },
      });
    }
    // step: get or create supplier type
    let supplierType = await prisma.supplierTypes.findFirst();
    if (!supplierType) {
      supplierType = await prisma.supplierTypes.create({
        data: {
          name: "Factory",
          description: "Factory description",
        },
      });
    }

    // step: create new user and supplier
    const user = await prisma.users.create({
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
        emailOtp: await hash(otpCode),
        emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    const supplier = await prisma.suppliers.create({
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
    const user = await prisma.users.findUnique({ where: { email } });
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

  // ============================ confirmEmail ============================
  confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstOtp, secondOtp }: confirmEmaiDTO = req.body;
    // step: check user exitance
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "User not found");
    }
    // step: check emailOtp
    if (!user.emailOtp || !(await compare(firstOtp, user.emailOtp))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid otp");
    }
    if (
      user.emailOtp_expiredAt &&
      user.emailOtp_expiredAt < new Date(Date.now())
    ) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "otp expired");
    }
    // step: case 1 email not confrimed (confirm first email)
    if (!user.is_confirmed) {
      // step: confirm email
      const updatedUser = await prisma.users.update({
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
    // step: check newEmailOtp
    if (!user.newEmailOtp || !(await compare(secondOtp, user.newEmailOtp))) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Invalid otp for second email"
      );
    }
    if (
      user.newEmailOtp_expiredAt &&
      user.newEmailOtp_expiredAt < new Date(Date.now())
    ) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "otp expired for second email"
      );
    }
    // step: confirm email
    const newEmail = user.newEmail;
    const updatedUser = await prisma.users.update({
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
    const { newEmail }: updateEmaiDTO = req.body;
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
      to: newEmail,
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
    // step: save emailOtp, newEmail and newEmailOtp
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        emailOtp: await hash(otpCodeForCurrentEmail),
        emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
        newEmail,
        newEmailOtp: await hash(otpCodeForNewEmail),
        newEmailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return responseHandler({
      res,
      message:
        "OTP sended for current email and new email, please confirm new email to save updates",
    });
  };

  // ============================ resendEmailOtp ============================
  resendEmailOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: resendEmailOtpDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.users.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check if email otp not expired yet
    if (
      user.emailOtp_expiredAt &&
      user.emailOtp_expiredAt > new Date(Date.now())
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
    // step: update emailOtp
    const updatedUser = await prisma.users.update({
      where: { email: user.email },
      data: {
        emailOtp: await hash(otpCode),
        emailOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return responseHandler({ res, message: "OTP sended successfully" });
  };

  // ============================ updatePassword ============================
  updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    const { currentPassword, newPassword }: updatePasswordDTO = req.body;
    // step: check password correction
    if (!(await compare(currentPassword, user.password))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    // step: check newPassword not equal currentPassword
    if (await compare(newPassword, user.password)) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "You can not make new password equal to old password"
      );
    }
    // step: update password and credentialsChangedAt
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        password: await hash(newPassword),
        credentialsChangedAt: new Date(Date.now()),
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
    const isUserExist = await prisma.users.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check if password otp not expired yet
    if (
      user.passwordOtp_expiredAt &&
      user.passwordOtp_expiredAt > new Date(Date.now())
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
    // step: update passwordOtp
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        passwordOtp: await hash(otpCode),
        passwordOtp_expiredAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
    return responseHandler({
      res,
      message: "OTP sended to email, please use it to restart your password",
    });
  };

  // ============================ changePassword ============================
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword }: changePasswordDTO = req.body;
    // step: check email existence
    const isUserExist = await prisma.users.findUnique({ where: { email } });
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check otp
    if (!(await compare(otp, user.passwordOtp as string))) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid OTP");
    }
    // step: change password
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        password: await hash(newPassword),
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
    // step: change credentialsChangedAt
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { credentialsChangedAt: new Date(Date.now()) },
    });
    return responseHandler({
      res,
      message: "Logged out successfully",
    });
  };
}
