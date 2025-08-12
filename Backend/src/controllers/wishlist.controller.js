import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Wishlist } from "../models/wishlist.models.js";
import { Product } from "../models/products.models.js";

// Add product to wishlist
export const addToWishlist = asynchandler(async (req, res) => {
  const { product_id } = req.body;
  const user_id = req.user._id;

  if (!product_id) {
    throw new apierror(400, "Product ID is required");
  }

  // Check if product exists
  const product = await Product.findById(product_id);
  if (!product) {
    throw new apierror(404, "Product not found");
  }

  // Check if already in wishlist
  const existingWishlist = await Wishlist.findOne({ user_id, product_id });
  if (existingWishlist) {
    throw new apierror(409, "Product already in wishlist");
  }

  const wishlistItem = await Wishlist.create({
    user_id,
    product_id,
  });

  return res.status(201).json(
    new apiresponse(201, { wishlistItem }, "Product added to wishlist")
  );
});

// Remove product from wishlist
export const removeFromWishlist = asynchandler(async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user._id;

  const wishlistItem = await Wishlist.findOneAndDelete({ user_id, product_id });
  if (!wishlistItem) {
    throw new apierror(404, "Product not found in wishlist");
  }

  return res.status(200).json(
    new apiresponse(200, {}, "Product removed from wishlist")
  );
});

// Get user's wishlist with product details
export const getUserWishlist = asynchandler(async (req, res) => {
  const user_id = req.user._id;

  const wishlist = await Wishlist.aggregate([
    {
      $match: { user_id: user_id }
    },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $lookup: {
        from: "productpricings",
        localField: "product_id",
        foreignField: "product_id",
        as: "pricing"
      }
    },
    {
      $addFields: {
        hourlyRate: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$pricing",
                  as: "p",
                  cond: { $eq: ["$$p.unit_type", "hour"] }
                }
              },
              as: "priceItem",
              in: "$$priceItem.price_per_unit"
            }
          }
        },
        dailyRate: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$pricing",
                  as: "p",
                  cond: { $eq: ["$$p.unit_type", "day"] }
                }
              },
              as: "priceItem",
              in: "$$priceItem.price_per_unit"
            }
          }
        },
        weeklyRate: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$pricing",
                  as: "p",
                  cond: { $eq: ["$$p.unit_type", "week"] }
                }
              },
              as: "priceItem",
              in: "$$priceItem.price_per_unit"
            }
          }
        },
        monthlyRate: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$pricing",
                  as: "p",
                  cond: { $eq: ["$$p.unit_type", "month"] }
                }
              },
              as: "priceItem",
              in: "$$priceItem.price_per_unit"
            }
          }
        },
        yearlyRate: {
          $first: {
            $map: {
              input: {
                $filter: {
                  input: "$pricing",
                  as: "p",
                  cond: { $eq: ["$$p.unit_type", "year"] }
                }
              },
              as: "priceItem",
              in: "$$priceItem.price_per_unit"
            }
          }
        }
      }
    },
    {
      $project: {
        _id: "$product._id",
        name: "$product.name",
        description: "$product.description",
        category: "$product.category",
        image_url: "$product.image_url",
        quantity: "$product.quantity",
        average_rating: "$product.average_rating",
        hourlyRate: 1,
        dailyRate: 1,
        weeklyRate: 1,
        monthlyRate: 1,
        yearlyRate: 1,
        addedAt: "$createdAt"
      }
    }
  ]);

  return res.status(200).json(
    new apiresponse(200, { wishlist }, "Wishlist fetched successfully")
  );
});

// Check if product is in user's wishlist
export const checkWishlistStatus = asynchandler(async (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user._id;

  const wishlistItem = await Wishlist.findOne({ user_id, product_id });
  const isInWishlist = !!wishlistItem;

  return res.status(200).json(
    new apiresponse(200, { isInWishlist }, "Wishlist status checked")
  );
});
