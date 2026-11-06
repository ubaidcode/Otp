export function loadEnv(env = process.env) {
  for (const key of ["MONGO_URI", "JWT_SECRET", "OTP_SECRET"]) {
    if (!env[key] || (key !== "MONGO_URI" && env[key].length < 32))
      throw new Error(`Configure ${key} in .env`);
  }
  return {
    mongoUri: env.MONGO_URI,
    jwtSecret: env.JWT_SECRET,
    otpSecret: env.OTP_SECRET,
    port: Number(env.PORT || 4000),
  };
}
