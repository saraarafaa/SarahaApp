import mongoose from "mongoose";

export const userGender = {
  male: "male",
  female: "female",
};

export const userRole = {
  user: "user",
  admin: "admin",
};

export const userProvider = {
  system: "system",
  google: "google",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      requiered: true,
      minLength: 3,
      trim: true,
    },
    email: {
      type: String,
      requiered: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      requiered: true,
    },
    profileImage: {
      secure_url: {type: String},
      public_id: {type: String}
    },
    coverImages: [{
      secure_url: {type: String},
      public_id: {type: String}
    }],
    phone: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(userGender),
      default: userGender.female,
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.user,
    },
    otp: String,
    isDeleted: Boolean,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    provider:{
      type: String,
      enum: Object.values(userProvider),
      default: userProvider.system  
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
