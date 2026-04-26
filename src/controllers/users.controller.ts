import type { Request, Response } from "express";

const getMany = (req: Request, res: Response): void => {
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
