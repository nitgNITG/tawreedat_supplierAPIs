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
import { compare } from "../../utils/bcrypt";
import { sendEmail } from "../../utils/sendEmail/send.email";
import { decodeToken, TokenTypesEnum } from "../../utils/decodeToken";
import { IAuthServcie } from "../../types/global.interfaces";
import { AppError } from "../../core/errors/app.error";
import { responseHandler } from "../../core/handlers/response.handler";
import { HttpStatusCode } from "../../core/http/http.status.code";

export class AuthService implements IAuthServcie {
  constructor() {}

  // ============================ register ============================
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { firstName, lastName, email, password }: registerDTO = req.body;
    // step: check user existence
    const isUserExist = 'prisma code' // TODO
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
        receiverName: firstName,
        subject: "Confirm email",
      }),
    });
    if (!isEmailSended) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Error while sending email"
      );
    }
    // step: create new user
    const user = 'prisma code' // TODO
    if (!user) {
      throw new AppError(
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        "Creation failed"
      );
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user._id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user._id, userEmail: user.email },
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
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, password }: loginDTO = req.body;
    // step: check credentials
    const isUserExist = 'prisma code' // TODO
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    const user = isUserExist;
    if (!(await compare(password, user.password))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid credentials");
    }
    // step: create token
    const accessToken = createJwt(
      { userId: user._id, userEmail: user.email },
      process.env.ACCESS_SEGNATURE as string,
      {
        expiresIn: "1h",
        jwtid: createOtp(),
      }
    );
    const refreshToken = createJwt(
      { userId: user._id, userEmail: user.email },
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
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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
  confirmEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, firstOtp, secondOtp }: confirmEmaiDTO = req.body;
    // step: check user exitance
    const user = 'prisma code' // TODO
    if (!user) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "User not found");
    }
    // step: check emailOtp
    if (!(await compare(firstOtp, user.emailOtp.otp))) {
      throw new AppError(HttpStatusCode.UNAUTHORIZED, "Invalid otp");
    }
    if (user.emailOtp.expiredAt < new Date(Date.now())) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "otp expired");
    }
    // step: case 1 email not confrimed (confirm first email)
    if (!user.emailConfirmed) {
      // step: confirm email
      const updatedUser = 'prisma code' // TODO
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
    if (!(await compare(secondOtp, user.newEmailOtp.otp))) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Invalid otp for second email"
      );
    }
    if (user.newEmailOtp.expiredAt < new Date(Date.now())) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "otp expired for second email"
      );
    }
    // step: confirm email
    const newEmail = user.newEmail;
    const updatedUser = 'prisma code' // TODO
    return responseHandler({
      res,
      message: "New email confirmed successfully",
    });
  };

  // ============================ updateEmail ============================
  updateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    const { newEmail }: updateEmaiDTO = req.body;
    // step: check if email confirmed
    if (!user.emailConfirmed) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Please confirm email to update it"
      );
    }
    // step: send otp to current email
    const otpCodeForCurrentEmail = createOtp();
    const { isEmailSended } = await sendEmail({
      to: user.email,
      subject: "Tawreedat",
      html: template({
        otpCode: otpCodeForCurrentEmail,
        receiverName: user.firstName,
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
      subject: "Tawreedat",
      html: template({
        otpCode: otpCodeForNewEmail,
        receiverName: user.firstName,
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
    const updatedUser = 'prisma code' // TODO

    return responseHandler({
      res,
      message:
        "OTP sended for current email and new email, please confirm new email to save updates",
    });
  };

  // ============================ resendEmailOtp ============================
  resendEmailOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email }: resendEmailOtpDTO = req.body;
    // step: check email existence
    const isUserExist = 'prisma code' // TODO
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check if email otp not expired yet
    if (user.emailOtp?.expiredAt > new Date(Date.now())) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet"
      );
    }
    // step: send email otp
    const otpCode = createOtp();
    const { isEmailSended, info } = await sendEmail({
      to: email,
      subject: "Tawreedat",
      html: template({
        otpCode,
        receiverName: user.firstName,
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
    const updatedUser = 'prisma code' // TODO
    return responseHandler({ res, message: "OTP sended successfully" });
  };

  // ============================ updatePassword ============================
  updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
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
    const updatedUser = 'prisma code' // TODO
    return responseHandler({
      res,
      message: "Password updated successfully, please login again",
    });
  };

  // ============================ forgetPassword ============================
  forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email }: forgetPasswordDTO = req.body;
    // step: check email existence
    const isUserExist = 'prisma code' // TODO
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check if password otp not expired yet
    if (user.passwordOtp?.expiredAt > new Date(Date.now())) {
      throw new AppError(
        HttpStatusCode.BAD_REQUEST,
        "Your OTP not expired yet"
      );
    }
    // step: send email otp
    const otpCode = createOtp();
    // const otpCode = "555";
    const { isEmailSended, info } = await sendEmail({
      to: user.email,
      subject: "Reset password OTP",
      html: template({
        otpCode,
        receiverName: user.firstName,
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
    const updatedUser = 'prisma code' // TODO
    return responseHandler({
      res,
      message: "OTP sended to email, please use it to restart your password",
    });
  };

  // ============================ changePassword ============================
  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, otp, newPassword }: changePasswordDTO = req.body;
    // step: check email existence
    const isUserExist = 'prisma code' // TODO
    if (!isUserExist) {
      throw new AppError(HttpStatusCode.NOT_FOUND, "User not found");
    }
    const user = isUserExist;
    // step: check otp
    if (!(await compare(otp, user.passwordOtp.otp))) {
      throw new AppError(HttpStatusCode.BAD_REQUEST, "Invalid OTP");
    }
    // step: change password
    const updatedUser = 'prisma code' // TODO
    return responseHandler({
      res,
      message: "Password changed successfully, You have to login",
    });
  };

  // ============================ logout ============================
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = res.locals.user;
    // step: change credentialsChangedAt
    const updatedUser = 'prisma code' // TODO
    return responseHandler({
      res,
      message: "Logged out successfully",
    });
  };
}
