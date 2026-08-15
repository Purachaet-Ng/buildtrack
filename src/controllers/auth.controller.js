import { createUSer, findUserByEmail } from "../services/users.service.js";
import createHttpError from "http-errors";
import argon2 from "argon2";
import { createToken } from "../utils/jwt.js";
export async function registerUser(req, res, next) {
  const { firstname, lastname, email, password, phone, role, companyId } =
    req.body;

  const user = await findUserByEmail(email);
  //   console.log("user", user);

  if (user) {
    throw next(createHttpError(400, "user is already exist"));
  }
  const hashPassword = await argon2.hash(password);
  const newUser = await createUSer(
    firstname,
    lastname,
    email,
    hashPassword,
    phone,
    role,
    companyId,
  );
  res.status(201).json({
    message: "Register Successfully",
    data: newUser,
  });
}

export async function loginUser(req, res, next) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  const isMatch = await argon2.verify(user.passwordHash, password);

  if (!user || !isMatch) {
    return next(createHttpError[401]("invalid credentials"));
  }

  const token = await createToken(user);
  res.status(200).json({
    message: "login successfull",
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
