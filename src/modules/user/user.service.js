import userModel, { userProvider, userRole,} from "../../DB/models/user.model.js";
import { nanoid } from "nanoid";
import { generateToken, verifyToken, Encrypt, Decrypt, compareValue, hashValue, eventEmitter,} from "../../utils/index.js";
import revokeTokenModel from "../../DB/models/revoke-token.model.js";
import { customAlphabet } from "nanoid";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../../utils/cloudinary/index.js";

// -----------------Sign Up-----------------
export const signUp = async (req, res, next) => {
  const { name, email, password, gender, age, phone } = req.body;

  const arrPaths = []
  for (const file of req?.files?.attachments) {
    const {secure_url, public_id} = await cloudinary.uploader.upload(file?.path, {
    folder: 'sarahaApp/users/coverImages'
  })
  arrPaths.push({secure_url, public_id}) 
  }

  const {secure_url, public_id} = await cloudinary.uploader.upload(req?.files?.attachment[0]?.path, {
    folder: 'sarahaApp/users/profileImage'
  })
  if (await userModel.findOne({ email })) {
    throw new Error("Email already exists", { cause: 409 });
  }

  const hashedPassword = await hashValue({
    plainText: password,
    saltRound: process.env.SALT_ROUNDS,
  });

  const encryptedPhone = Encrypt({
    plainText: phone,
    SECRET_KEY: process.env.SECRET_KEY,
  });


  eventEmitter.emit("sendEmail", { email });

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword,
    gender,
    age,
    phone: encryptedPhone,
    profileImage: {secure_url, public_id},
    coverImages: arrPaths
  });

  // await user.save()
  return res
    .status(201)
    .json({ message: "User created successfully", user });
};

// -----------------confirmEmail-----------------
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  if (!token) throw new Error("Token Not Found", { cause: 404 });

  const decode = await verifyToken({ token, SIGNITURE: process.env.SIGNITURE });
  const user = await userModel.findOne({
    email: decode.email,
    confirmed: false,
  });

  if (!user)
    throw new Error("User Not Found OR already confirmed", { cause: 400 });

  user.confirmed = true;
  await user.save();

  return res.status(200).json({ message: "Confirmed" });
};

// -----------------Sign In-----------------
export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, confirmed: true });

  if (!user) {
    throw new Error("User Not Found OR Not confirmed", { cause: 404 });
  }
  const validPassword = await compareValue({
    plainText: password,
    cipherText: user.password,
  });

  if (!validPassword) {
    throw new Error("InValid password", { cause: 400 });
  }

  const access_token = await generateToken({
    payload: { id: user.id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.ACCESS_TOKEN
        : process.env.ACCESS_TOKEN_ADMIN,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });

  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.REFRESH_TOKEN
        : process.env.REFRESH_TOKEN_ADMIN,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res
    .status(200)
    .json({
      message: "User signed in successfully",
      access_token,
      refresh_token,
    });
};

// -----------------Login With Google-----------------
export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email, picture, name, email_verified } = await verify();
  let user = await userModel.findOne({ email });

  if (!user) {
    user = await userModel.create({
      email,
      name,
      image: picture,
      confirmed: email_verified,
      password: nanoid(),
      provider: userProvider.google,
    });
  }
  if (user) throw new Error("Email already exists", { cause: 409 });

  if (user.provider !== userProvider.google) {
    throw new Error("LOGIN ON SYSTEM", { cause: 400 });
  }

  const access_token = await generateToken({
    payload: { id: user.id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.ACCESS_TOKEN
        : process.env.ACCESS_TOKEN_ADMIN,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });

  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.REFRESH_TOKEN
        : process.env.REFRESH_TOKEN_ADMIN,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  return res
    .status(200)
    .json({
      message: "User signed in successfully",
      access_token,
      refresh_token,
    });
};

// -----------------Get profile-----------------
export const getProfile = async (req, res, next) => {
  const phone = await Decrypt({
    plainText: req.user.phone,
    secretKey: process.env.SECRET_KEY,
  });
  req.user.phone = phone;

  return res
    .status(200)
    .json({ message: "User profile retrieved successfully", user: req.user });
};

// -----------------Get profile data-----------------
export const getProfileData = async (req, res, next) => {
  const { id } = req.params;

  const user = await userModel
    .findById(id)
    .select("name gender age image -_id");
  if (!user) throw new Error("User not found", { cause: 404 });

  return res
    .status(200)
    .json({ message: "User data retrieved successfully", user });
};

// -----------------logout-----------------
export const logout = async (req, res, next) => {
  const revoke = await revokeTokenModel.create({
    tokenId: req.decode.jti,
    expireAt: req.decode.exp,
  });
  return res.status(200).json({ message: "success", revoke });
};
// -----------------Refresh Token-----------------
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const [prefix, token] = authorization.split(" ") || [];

  let signature = "";
  if (!prefix || !token) {
    throw new Error("Token Not Sent", { cause: 404 });
  }

  if (prefix == "bearer") {
    signature = process.env.REFRESH_TOKEN;
  } else if (prefix == "admin") {
    signature = process.env.REFRESH_TOKEN_ADMIN;
  } else {
    throw new Error("InValid Prefix", { cause: 400 });
  }

  const decode = await verifyToken({ token, SIGNITURE: signature });

  if (!decode?.email) throw new Error("InValid Token", { cause: 400 });

  const revoked = await revokeTokenModel.findOne({ tokenId: decode.jti });
  if (revoked) {
    throw new Error("User logged Out", { cause: 400 });
  }

  const user = await userModel.findOne({ email: decode.email }).lean();

  if (!user) {
    throw new Error("User Not Found", { cause: 404 });
  }
  const access_token = await generateToken({
    payload: { id: user.id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.ACCESS_TOKEN
        : process.env.ACCESS_TOKEN_ADMIN,
    options: { expiresIn: "1h", jwtid: nanoid() },
  });

  const refresh_token = await generateToken({
    payload: { id: user._id, email: user.email },
    SIGNITURE:
      user.role == userRole.user
        ? process.env.REFRESH_TOKEN
        : process.env.REFRESH_TOKEN_ADMIN,
    options: { expiresIn: "1y", jwtid: nanoid() },
  });
  return res
    .status(200)
    .json({ message: "success", access_token, refresh_token });
};

// -----------------updatePassword-----------------
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (
    !(await compareValue({
      plainText: oldPassword,
      cipherText: req.user.password,
    }))
  )
    throw new Error("InValid Password", { cause: 400 });

  const hash = await hashValue({ plainText: newPassword });
  req.user.password = hash;
  await req.user.save();

  await revokeTokenModel.create({
    tokenId: req?.decode?.jti,
    expireAt: req?.decode?.exp,
  });

  return res
    .status(200)
    .json({ message: "password updated successfully", user: req.user });
};
// -----------------forgetPassword-----------------
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) throw new Error("User Not Found", { cause: 404 });

  const otp = customAlphabet("0123456789", 4)();

  eventEmitter.emit("forgetPassword", { email, otp });

  user.otp = await hashValue({ plainText: otp });
  await user.save();

  return res.status(200).json({ message: "success" });
};
// -----------------resetPassword-----------------
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email, otp: { $exists: true } });
  if (!user) throw new Error("User Not Found Or Expired OTP", { cause: 404 });

  if (!(await compareValue({ plainText: otp, cipherText: user.otp })))
    throw new Error("InValid OTP", { cause: 400 });
  const hash = await hashValue({ plainText: newPassword });

  await userModel.updateOne(
    { email },
    {
      password: hash,
      $unset: { otp: "" },
    }
  );

  return res.status(200).json({ message: "success" });
};

// -----------------update profile-----------------
export const updateProfile = async (req, res, next) => {
  const { name, email, gender, phone, age } = req.body;

  if (name) req.user.name = name;
  if (gender) req.user.gender = gender;
  if (age) req.user.age = age;
  if (phone) {
    const encryptedPhone = Encrypt({
      plainText: phone,
      SECRET_KEY: process.env.SECRET_KEY,
    });
    req.user.phone = encryptedPhone;
  }
  if (email) {
    if (await userModel.findOne({ email }))
      throw new Error("Email already exist", { cause: 409 });
    eventEmitter.emit("sendEmail", { email });

    req.user.email = email;
    req.user.confirmed = false;
  }

  await req.user.save();

  return res
    .status(200)
    .json({ message: "User profile retrieved successfully", user: req.user });
};

// -----------------freeze profile-----------------
export const freezeProfile = async (req, res, next) => {
  const { id } = req.params;
  if (id && req.user.role !== userRole.admin)
    throw new Error("You are not allowed to freeze this account", {
      cause: 403,
    });

  const user = await userModel.updateOne(
    {
      _id: id || req.user._id,
      isDeleted: { $exists: false },
    },
    {
      isDeleted: true,
      deletedBy: req.user._id,
    },
    {
      $inc: { __v: 1 },
    }
  );

  user.matchedCount
    ? res.status(200).json({ message: "Account Freezed" })
    : res
        .status(400)
        .json({ message: "Fail to Freeze account Or ALready freezed" });
};

// -----------------unfreeze profile-----------------
export const unfreezeProfile = async (req, res, next) => {
  const { id } = req.params;
  if (id && req.user.role !== userRole.admin)
    throw new Error("You are not allowed to freeze this account", {
      cause: 403,
    });

  const user = await userModel.updateOne(
    {
      _id: id || req.user._id,
      isDeleted: { $exists: true },
    },
    {
      $unset: { isDeleted: "", deletedBy: "" },
    },
    {
      $inc: { __v: 1 },
    }
  );

  user.matchedCount
    ? res.status(200).json({ message: "Account unFreezed" })
    : res
        .status(400)
        .json({ message: "Fail to unFreeze account Or ALready restored" });
};

// -----------------Delete profile-----------------
export const deleteAccount = async (req, res, next) => {
    const { id } = req.params;

    if (req?.user?._id.toString() !== id) {
      throw new Error("Not authorized", {cause: 403});
    }
    const result = await userModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new Error("User not found", {cause: 404});
    }

    return res.status(200).json({ message: "Account Deleted successfully" });
  }

// -----------------Update profile Image-----------------
export const updateProfileImage = async (req, res, next) => {
  const {secure_url, public_id} = await cloudinary.uploader.upload(req?.file.path, {
    folder: 'sarahaApp/users/profileImage'
  })

  const user = await userModel.findByIdAndUpdate({_id: req?.user?._id}, {profileImage : {secure_url, public_id}})

  await cloudinary.uploader.destroy(user?.profileImage?.public_id)
    return res.status(200).json({ message: "Profile Picture Updated", user });
  }


