import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  userLoginValidation,
  userSignupValidation,
} from "../zodValidation/usermodel.js";
import { prisma } from "../dataBase/prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const register = async (req, res) => {
  try {
    const userData = userSignupValidation.parse(req.body);
    const foundUser = await prisma.user.findFirst({
      where: { email: userData.email },
    });
    if (foundUser) {
      throw new ApiError(409, "Email is Already exist");
    }
    const salt = await bcrypt.genSalt(5);
    const hashPassword = await bcrypt.hash(userData.password, salt);
    const createUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashPassword,
        image: userData.image,
      },
    });
    res.status(201).json(new ApiResponse(201, createUser, "user is created"));
  } catch (error) {
    if (error.issues) {
      const errors = error.issues.map((element) => {
        return {
          message: element.message,
          code: element.code,
        };
      });
      res.status(400).json(new ApiError(400, errors));
    } else {
      console.error(error);
      res
        .status(error.statusCode || 500)
        .json(
          new ApiError(
            error.statusCode || 500,
            error.error || "Internal Server Error"
          )
        );
    }
  }
};

const login = async (req, res) => {
  try {
    const userData = userLoginValidation.parse(req.body);
    const foundUser = await prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    // console.log("foundUser",foundUser)

    if (!foundUser) {
      throw new ApiError(404, "please give valid data");
    }

    const matchPassword = await bcrypt.compare(
      userData.password,
      foundUser.password
    );
    if (!matchPassword) {
      throw new ApiError(404, "Wrong Credentials");
    }
    const token = jwt.sign(foundUser.email, process.env.SECRET_KEY);
    const user = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      image: foundUser.image,
    };
    res.status(200).json(new ApiResponse(200, { token, user }, "Login done"));
  } catch (error) {
    console.error(error);
    if (error.issues) {
      const errors = error.issues.map((element) => {
        return {
          message: element.message,
          code: element.code,
        };
      });
      res.status(400).json(new ApiError(400, errors));
    } else {
      console.error(error);
      res
        .status(error.statusCode || 500)
        .json(
          new ApiError(
            error.statusCode || 500,
            error.error || "Internal Server Error"
          )
        );
    }
  }
};

const search = async (req, res) => {
  try {
    const query = req.query.q;
    // console.log("query*********",query);
    const foundUsers = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive", // This makes the search case-insensitive
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    res.status(200).json(new ApiResponse(200, foundUsers, "all found users"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          error.error || "Internal Server Error"
        )
      );
  }
};

const getAllFriends = async (req, res) => {
  try {
    const { id } = req.user;
    const foundUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    res.status(200).json(new ApiResponse(200, foundUsers, "Your friends"));
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          error.error || "Internal Server Error"
        )
      );
  }
};
export { register, login, search, getAllFriends };
