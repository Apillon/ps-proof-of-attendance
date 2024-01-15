import { Application } from "express";
import {
  PopulateStrategy,
  RouteErrorCode,
  SerializedStrategy,
} from "../config/values";
import { NextFunction, Request, Response } from "../http";
import { PoapDrop } from "../models/poap-drop";
import { ResourceError } from "../lib/errors";

/**
 * Installs new route on the provided application.
 * @param app ExpressJS application.
 */
export function inject(app: Application) {
  app.get("/poap-drops", (req: Request, res: Response, next: NextFunction) => {
    getPoapDrops(req, res).catch(next);
  });

  app.put("/poap-drops", (req: Request, res: Response, next: NextFunction) => {
    putPoapDrop(req, res).catch(next);
  });
}

export async function getPoapDrops(req: Request, res: Response): Promise<void> {
  const { context, params, query } = req;
  return res.respond(200, await new PoapDrop({}, { context }).getList(query));
}

export async function putPoapDrop(req: Request, res: Response): Promise<void> {
  const { context, body } = req;

  const poapDrop = new PoapDrop({}, { context });

  if (!body.id) {
    //Create
    poapDrop.populate(body, PopulateStrategy.ADMIN);

    //TODO: Validate collection

    await poapDrop.validateAndCreate();

    return res.respond(201, poapDrop.serialize(SerializedStrategy.ADMIN));
  } else {
    //Update
    await poapDrop.populateById(body.id);
    if (!poapDrop.exists()) {
      throw new ResourceError(RouteErrorCode.POAP_DROP_DOES_NOT_EXISTS);
    }

    poapDrop.populate(body, SerializedStrategy.ADMIN);

    await poapDrop.validateAndUpdate();
  }
}
