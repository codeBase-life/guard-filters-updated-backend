require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 8000;
const fs = require("fs");
const path = require("path");
// const mongodb_uri = process.env.MONGODB_URI;
// const cloudinary_name = process.env.CLOUDINARY_CLOUD_NAME;
// const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
// const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
const products = require("./products.json");

const recently_file = path.join(__dirname, "./recently_viewed.json");
const read_file = () => {
  try {
    if (!fs.existsSync(recently_file)) {
      return [];
    }
    const data = fs.readFileSync(recently_file, "utf-8");
    const parse_data = JSON.parse(data);

    parse_data.forEach((item) => {
      console.log(item);
    });
    return parse_data;
  } catch (error) {
    console.error("error reading file", error);
    return [];
  }
};
const write_file = (data) => {
  try {
    let read_data = read_file();
    if (!Array.isArray(read_data)) {
      read_data = [];
    }
    read_data = read_data.filter((item) => item.id !== data.id);
    read_data.unshift(data);
    if (read_data.length > 4) {
      read_data.pop();
    }
    fs.writeFileSync(
      recently_file,
      JSON.stringify(read_data, null, 2),
      "utf-8"
    );
    console.log("data written to file successfully");
  } catch (error) {
    console.error("error writing to file ", error);
  }
};
app.use(cors());

app.get("/", (req, res) => {
  res.send("home route");
});
// sending for search functionality
app.get("/products/:search", (req, res) => {
  const search = req.params.search;
  const searched_items = products.filter((item) =>
    item.title.toLowerCase().includes(search)
  );
  res.json(searched_items);
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

const similarProducts = (product) => {
  const similar = products.filter(
    (item) => item.filter_type === product.filter_type
  );

  return similar.slice(0, 4);
};

app.get("/api/product/:id", (req, res) => {
  const id = req.params.id;
  const product = products.find((item) => item.id == id);
  const similar_products = similarProducts(product);
  // write_file(product);
  // first function data
  const firstRandomFun = () => {
    const firstRandomNext = Math.floor(Math.random() * products.length + 1);
    let firstRandomPrev = Math.floor(Math.random() * products.length + 1);
    while (firstRandomNext === firstRandomPrev) {
      firstRandomPrev = Math.floor(Math.random() * products.length + 1);
    }
    return [firstRandomNext, firstRandomPrev];
  };
  const [firstRandomNext, firstRandomPrev] = firstRandomFun();

  const firstRandomProducts = (firstRandomNext, firstRandomPrev) => {
    const randomProductFirst = products.filter(
      (item) => item.id == firstRandomNext
    );
    const randomProductSecond = products.filter(
      (item) => item.id === firstRandomPrev
    );
    return [randomProductFirst, randomProductSecond];
  };
  const [randomProductFirst, randomProductSecond] = firstRandomProducts(
    firstRandomNext,
    firstRandomPrev
  );
  // second function data
  const secondRandomFun = () => {
    let secondRandomNext = Math.floor(Math.random() * products.length + 1);
    let secondRandomPrev = Math.floor(Math.random() * products.length + 1);
    while (secondRandomNext === secondRandomPrev) {
      secondRandomNext = Math.floor(Math.random() * products.length);
    }
    return [secondRandomNext, secondRandomPrev];
  };
  const [secondRandomNext, secondRandomPrev] = secondRandomFun();
  const secondRandomProducts = (first, second) => {
    const randomFirst = products.find((item) => item.id == first);
    const randomSecond = products.find((item) => item.id == second);
    return [randomFirst, randomSecond];
  };
  const [randomFirst, randomSecond] = secondRandomProducts(
    secondRandomNext,
    secondRandomPrev
  );
  res.json({
    actualProduct: product,
    topProductFirst: randomProductFirst,
    topProductSecond: randomProductSecond,
    middleProductFirst: randomFirst,
    middleProductSecond: randomSecond,
    similar: similar_products,
  });
});

app.listen(port || 8000, () => {
  console.log("server portrunning on ", port);
});
