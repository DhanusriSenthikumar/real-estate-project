import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../prisma/db.js";
import { env } from "../config/env.js";

export const createUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.orm.public.User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const user = await db.orm.public.User
    .where((u) => u.email.eq(email))
    .first();

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    return null;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};