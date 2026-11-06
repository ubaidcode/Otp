export const pagination = ({ page = 1, limit = 20 } = {}) => ({ skip: (page - 1) * limit, limit });
export function listingQuery(query) {
  const filter = { status: "published", deleted: false };
  if (query.q)
    filter.title = { $regex: query.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (query.condition) filter.condition = query.condition;
  if (query.city) filter.city = query.city;
  if (query.category) filter.category = query.category;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }
  return filter;
}
