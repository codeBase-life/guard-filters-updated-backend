require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;
const mongodb_uri = process.env.MONGODB_URI;
const cloudinary_name = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
const products = require("./products.json");

app.use(cors());

app.get("/", (req, res) => {
  res.send("home route");
});
app.get("/api/products", (req, res) => {
  const { year, make, model, type, page, limit } = req.query;
  let filteredProducts = products;
  if (year) {
    filteredProducts = filteredProducts.filter((value) => value.year == year);
    // console.log(filteredProducts);
  }
  if (make) {
    filteredProducts = filteredProducts.filter((value) => value.make == make);
  }
  if (model) {
    filteredProducts = filteredProducts.filter((value) => value.model == model);
  }
  if (type) {
    filteredProducts = filteredProducts.filter(
      (value) => value.filter_type == type
    );
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 3;
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    totalProducts,
    totalPages,
    currentPage: pageNum,
    limit: limitNum,
    Products: paginatedProducts,
  });
});
app.get("/api/products/filter_values", (req, res) => {
  const make = products.map((item) => item.make);

  const year = products.map((item) => item.year);
  const model = products.map((item) => item.model);
  const type = products.map((item) => item.filter_type);

  const values = {
    year: year,
    make: make,
    model: model,
    type: type,
  };

  res.json(values);
});

app.listen(port || 8000, () => {
  console.log("server portrunning on ", port);
});
