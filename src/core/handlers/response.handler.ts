import { Response } from "express";

export const responseHandler = ({
  res,
  status = 200,
  message = "OK",
  data = {},
  ...rest
}: {
  res: Response;
  status?: number;
  message?: string;
  data?: Object;
  [key: string]: any;
}): Response => {
  return res.status(status).json({ status, message, data, ...rest });
};
