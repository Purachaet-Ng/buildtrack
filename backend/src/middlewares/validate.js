import createHttpError from "http-errors";

/**
 * Runs Zod schemas over the request. Parsed (coerced) values land on
 * `req.valid` — Express 5 makes `req.query` read-only, so the originals
 * are left untouched.
 *
 *   router.post("/", validate({ body: createProjectBody }), addProject);
 */
export const validate = (schemas) => (req, res, next) => {
  req.valid = req.valid ?? {};

  for (const source of ["params", "query", "body"]) {
    const schema = schemas[source];
    if (!schema) continue;

    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || source,
        message: issue.message,
      }));
      // errorHandler sends `message`; `errors` carries the full list
      return next(createHttpError(400, errors[0].message, { errors }));
    }

    req.valid[source] = result.data;
  }

  next();
};
