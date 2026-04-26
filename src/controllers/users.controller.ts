import type { Request, Response } from "express";
import {InternalServerError} from "../utils/errors/app.error.ts";
import {logger} from "../config/logger.config.ts";

const getMany = (req: Request, res: Response): void => {
  logger.error("users: getAll -> failure");
  throw new InternalServerError(":)")
  res.status(200).json(`Get Many Users`);
};

const getOne = (req: Request, res: Response): void => {
  res.status(200).json(`Get One User`);
};

const create = (req: Request, res: Response): void => {
  res.status(200).json(`Create One User`);
};

const update = (req: Request, res: Response): void => {
  res.status(200).json(`Update One User`);
};

const remove = (req: Request, res: Response): void => {
  res.status(200).json(`Remove User`);
};

export { getMany, getOne, create, update, remove };
