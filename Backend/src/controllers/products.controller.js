import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/apiresponse.js";
import { Product } from "../models/products.models.js";
import { ProductPricing } from "../models/productprising.models.js";
import { uploadoncloudinary } from "../utils/cloudnary.js";
import mongoose from "mongoose";

// Add product with image (multer provides req.file)
export const addProduct = asynchandler(async (req, res) => {
  const { name, description, category, quantity = 0, hourlyRate, dailyRate, weeklyRate, monthlyRate, yearlyRate } = req.body;

  if (!name || !description) throw new apierror(400, "name and description are required");

  let image_url = null;
  if (req.file?.path) {
    const cloudinaryResult = await uploadoncloudinary(req.file.path);
    if (!cloudinaryResult) throw new apierror(500, "Image upload failed");
    image_url = cloudinaryResult.secure_url; // use secure URL
  }
  console.log(image_url);

  const product = await Product.create({
    name,
    description,
    category,
    quantity: Math.max(0, Number(quantity) || 0),
    image_url,
  });

  const pricings = [];
  if (hourlyRate) pricings.push({ unit_type: "hour", price_per_unit: Number(hourlyRate), min_duration: 1 });
  if (dailyRate) pricings.push({ unit_type: "day", price_per_unit: Number(dailyRate), min_duration: 1 });
  if (weeklyRate) pricings.push({ unit_type: "week", price_per_unit: Number(weeklyRate), min_duration: 1 });
  if (monthlyRate) pricings.push({ unit_type: "month", price_per_unit: Number(monthlyRate), min_duration: 1 });
  if (yearlyRate) pricings.push({ unit_type: "year", price_per_unit: Number(yearlyRate), min_duration: 1 });

  if (pricings.length) {
    await ProductPricing.insertMany(pricings.map((p) => ({ ...p, product_id: product._id })));
  }

  return res.status(201).json(new apiresponse(201, { product }, "Product created"));
});

// Update product stock by product id
export const updateStock = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const num = Math.max(0, Number(quantity));
  const product = await Product.findByIdAndUpdate(id, { $set: { quantity: num } }, { new: true });
  if (!product) throw new apierror(404, "Product not found");
  return res.status(200).json(new apiresponse(200, { product }, "Stock updated"));
});

// List/search products; optional category filter; join pricing and expose summary rates
export const listProducts = asynchandler(async (req, res) => {
  const { category, sortBy = 'createdAt', sortOrder = 'desc', available } = req.query;

  const pipeline = [
    ...(category ? [{ $match: { category: String(category) } }] : []),
    ...(available === 'true' ? [{ $match: { quantity: { $gt: 0 } } }] : []),
    ...(available === 'false' ? [{ $match: { quantity: { $lte: 0 } } }] : []),
    {
      $lookup: {
        from: "productpricings",
        localField: "_id",
        foreignField: "product_id",
        as: "pricing",
      },
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
        },
        // Add a default price for sorting (use daily rate as default)
        defaultPrice: {
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
        }
      }
    },
    {
      $project: {
        pricing: 0,
      },
    },
  ];

  // Add sorting
  const sortField = sortBy === 'price' ? 'defaultPrice' : sortBy;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  
  pipeline.push({
    $sort: { [sortField]: sortDirection }
  });

  const products = await Product.aggregate(pipeline);
  return res.status(200).json(new apiresponse(200, { products }, "Products fetched"));
});

// Delete product
export const deleteProduct = asynchandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new apierror(404, "Product not found");
  
  // Also delete associated pricing
  await ProductPricing.deleteMany({ product_id: id });
  
  return res.status(200).json(new apiresponse(200, {}, "Product deleted"));
});

// Update product
export const updateProduct = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category, quantity, hourlyRate, dailyRate, weeklyRate, monthlyRate, yearlyRate } = req.body;

  let image_url = undefined;
  if (req.file?.path) {
    const cloudinaryResult = await uploadoncloudinary(req.file.path);
    if (!cloudinaryResult) throw new apierror(500, "Image upload failed");
    image_url = cloudinaryResult.secure_url;
  }

  const updateData = { name, description, category, quantity: Math.max(0, Number(quantity) || 0) };
  if (image_url) updateData.image_url = image_url;

  const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
  if (!product) throw new apierror(404, "Product not found");

  // Update pricing
  await ProductPricing.deleteMany({ product_id: id });
  
  const pricings = [];
  if (hourlyRate) pricings.push({ unit_type: "hour", price_per_unit: Number(hourlyRate), min_duration: 1 });
  if (dailyRate) pricings.push({ unit_type: "day", price_per_unit: Number(dailyRate), min_duration: 1 });
  if (weeklyRate) pricings.push({ unit_type: "week", price_per_unit: Number(weeklyRate), min_duration: 1 });
  if (monthlyRate) pricings.push({ unit_type: "month", price_per_unit: Number(monthlyRate), min_duration: 1 });
  if (yearlyRate) pricings.push({ unit_type: "year", price_per_unit: Number(yearlyRate), min_duration: 1 });

  if (pricings.length) {
    await ProductPricing.insertMany(pricings.map((p) => ({ ...p, product_id: product._id })));
  }

  return res.status(200).json(new apiresponse(200, { product }, "Product updated"));
});

// Get single product by ID
export const getProductById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const pipeline = [
    {
      $match: { _id: new mongoose.Types.ObjectId(id) }
    },
    {
      $lookup: {
        from: "productpricings",
        localField: "_id",
        foreignField: "product_id",
        as: "pricing",
      },
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
        pricing: 0,
      },
    },
  ];

  const products = await Product.aggregate(pipeline);
  
  if (!products.length) {
    throw new apierror(404, "Product not found");
  }

  return res.status(200).json(new apiresponse(200, { product: products[0] }, "Product fetched successfully"));
});


