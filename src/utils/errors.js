export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const assert = (condition, status, message) => {
  if (!condition) throw new AppError(status, message);
};
export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  city: user.city,
  phone: user.phone,
  role: user.role,
  verified: user.verified,
});
