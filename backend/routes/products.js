const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { query, get, run } = require("../database-adapter");

const router = express.Router();

// 設定圖片上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../images/products");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("只允許上傳圖片檔案"));
    }
  },
});

// 設定多檔案上傳 (用於 LightSlider 圖片)
const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 限制
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("只允許上傳圖片檔案"));
    }
  },
});

// 取得所有商品
router.get("/", async (req, res) => {
  try {
    const productResult = await query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    const products = productResult.rows || [];

    // 解析 JSON 欄位
    products.forEach((product) => {
      if (product.main_colors) {
        try {
          product.main_colors = JSON.parse(product.main_colors);
        } catch (e) {
          product.main_colors = [];
        }
      }
      if (product.sub_colors) {
        try {
          product.sub_colors = JSON.parse(product.sub_colors);
        } catch (e) {
          product.sub_colors = [];
        }
      }
      if (product.lightslider_images) {
        try {
          product.lightslider_images = JSON.parse(product.lightslider_images);
        } catch (e) {
          product.lightslider_images = [];
        }
      }
    });

    res.json({ products });
  } catch (error) {
    console.error("取得商品失敗:", error);
    res.status(500).json({ error: "取得商品失敗", message: error.message });
  }
});

// 取得單一商品
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await get("SELECT * FROM products WHERE product_id = ?", [
      id,
    ]);

    if (!product) {
      return res.status(404).json({ error: "商品不存在" });
    }

    // 解析 JSON 欄位
    if (product.main_colors) {
      try {
        product.main_colors = JSON.parse(product.main_colors);
      } catch (e) {
        product.main_colors = [];
      }
    }
    if (product.sub_colors) {
      try {
        product.sub_colors = JSON.parse(product.sub_colors);
      } catch (e) {
        product.sub_colors = [];
      }
    }
    if (product.lightslider_images) {
      try {
        product.lightslider_images = JSON.parse(product.lightslider_images);
      } catch (e) {
        product.lightslider_images = [];
      }
    }

    res.json({ product });
  } catch (error) {
    console.error("取得商品失敗:", error);
    res.status(500).json({ error: "取得商品失敗", message: error.message });
  }
});

// 新增商品
router.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lightslider_images", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        product_id,
        name,
        price,
        deposit,
        max_quantity,
        status,
        preorder_button_status,
        cell_open_status,
        cell_remaining_status,
        specifications,
        pickup_info,
        sketchfab_embed_link,
        sketchfab_background,
        product_introduction,
        preorder_notes,
        main_colors,
        sub_colors,
      } = req.body;

      if (
        !product_id ||
        !name ||
        price === undefined ||
        deposit === undefined
      ) {
        return res.status(400).json({ error: "缺少必要欄位" });
      }

      // 檢查商品 ID 是否已存在
      const existingProduct = await get(
        "SELECT id FROM products WHERE product_id = ?",
        [product_id]
      );
      if (existingProduct) {
        return res.status(400).json({ error: "商品 ID 已存在" });
      }

      // 處理圖片路徑
      let thumbnailPath = null;
      let lightsliderImages = [];

      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        thumbnailPath = `/images/products/${req.files.thumbnail[0].filename}`;
      }

      if (req.files && req.files.lightslider_images) {
        lightsliderImages = req.files.lightslider_images.map(
          (file) => `/images/products/${file.filename}`
        );
      }

      // 處理顏色配置
      const mainColorsJson = main_colors || "[]";
      const subColorsJson = sub_colors || "[]";
      const lightsliderImagesJson = JSON.stringify(lightsliderImages);

      const result = await run(
        `INSERT INTO products (
                product_id, name, price, deposit, max_quantity, status,
                preorder_button_status, cell_open_status, cell_remaining_status,
                specifications, pickup_info, thumbnail_path, lightslider_images,
                sketchfab_embed_link, sketchfab_background, product_introduction, preorder_notes,
                main_colors, sub_colors
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product_id,
          name,
          price,
          deposit,
          max_quantity || 3,
          status || "available",
          preorder_button_status || "select_style",
          cell_open_status || "preparing",
          cell_remaining_status || "still_available",
          specifications,
          pickup_info,
          thumbnailPath,
          lightsliderImagesJson,
          sketchfab_embed_link,
          sketchfab_background,
          product_introduction,
          preorder_notes,
          mainColorsJson,
          subColorsJson,
        ]
      );

      const product = await get("SELECT * FROM products WHERE id = ?", [
        result.id,
      ]);

      res.status(201).json({ success: true, product });
    } catch (error) {
      console.error("新增商品失敗:", error);
      res.status(500).json({ error: "新增商品失敗", message: error.message });
    }
  }
);

// 更新商品
router.put(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lightslider_images", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        price,
        deposit,
        max_quantity,
        status,
        preorder_button_status,
        cell_open_status,
        cell_remaining_status,
        specifications,
        pickup_info,
        sketchfab_embed_link,
        sketchfab_background,
        product_introduction,
        preorder_notes,
        main_colors,
        sub_colors,
      } = req.body;

      // 檢查商品是否存在
      const existingProduct = await get(
        "SELECT * FROM products WHERE product_id = ?",
        [id]
      );
      if (!existingProduct) {
        return res.status(404).json({ error: "商品不存在" });
      }

      // 處理圖片路徑
      let thumbnailPath = existingProduct.thumbnail_path;
      let lightsliderImages = existingProduct.lightslider_images
        ? JSON.parse(existingProduct.lightslider_images)
        : [];

      if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
        // 刪除舊縮圖
        if (existingProduct.thumbnail_path) {
          const oldThumbnailPath = path.join(
            __dirname,
            "../..",
            existingProduct.thumbnail_path
          );
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        }
        thumbnailPath = `/images/products/${req.files.thumbnail[0].filename}`;
      }

      if (req.files && req.files.lightslider_images) {
        // 刪除舊的 LightSlider 圖片
        if (existingProduct.lightslider_images) {
          const oldImages = JSON.parse(existingProduct.lightslider_images);
          oldImages.forEach((imagePath) => {
            const fullPath = path.join(__dirname, "../..", imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          });
        }
        lightsliderImages = req.files.lightslider_images.map(
          (file) => `/images/products/${file.filename}`
        );
      }

      // 處理顏色配置
      const mainColorsJson = main_colors || existingProduct.main_colors;
      const subColorsJson = sub_colors || existingProduct.sub_colors;
      const lightsliderImagesJson = JSON.stringify(lightsliderImages);

      const result = await run(
        `UPDATE products SET 
                name = ?, price = ?, deposit = ?, max_quantity = ?, status = ?,
                preorder_button_status = ?, cell_open_status = ?, cell_remaining_status = ?,
                specifications = ?, pickup_info = ?, thumbnail_path = ?, lightslider_images = ?,
                sketchfab_embed_link = ?, sketchfab_background = ?, product_introduction = ?, preorder_notes = ?,
                main_colors = ?, sub_colors = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE product_id = ?`,
        [
          name,
          price,
          deposit,
          max_quantity,
          status,
          preorder_button_status,
          cell_open_status,
          cell_remaining_status,
          specifications,
          pickup_info,
          thumbnailPath,
          lightsliderImagesJson,
          sketchfab_embed_link,
          sketchfab_background,
          product_introduction,
          preorder_notes,
          mainColorsJson,
          subColorsJson,
          id,
        ]
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: "商品不存在或更新失敗" });
      }

      const updatedProduct = await get(
        "SELECT * FROM products WHERE product_id = ?",
        [id]
      );

      res.json({ success: true, product: updatedProduct });
    } catch (error) {
      console.error("更新商品失敗:", error);
      res.status(500).json({ error: "更新商品失敗", message: error.message });
    }
  }
);

// 更新商品狀態和庫存
router.patch("/:id/stock", express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { max_quantity, status } = req.body;

    const result = await run(
      "UPDATE products SET max_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?",
      [max_quantity, status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    res.json({ success: true, message: "商品庫存更新成功" });
  } catch (error) {
    console.error("更新商品庫存失敗:", error);
    res.status(500).json({ error: "更新商品庫存失敗", message: error.message });
  }
});

// 刪除商品
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 取得商品資訊
    const product = await get(
      "SELECT thumbnail_path, lightslider_images FROM products WHERE product_id = ?",
      [id]
    );
    if (!product) {
      return res.status(404).json({ error: "商品不存在" });
    }

    // 刪除縮圖檔案
    if (product.thumbnail_path) {
      const thumbnailPath = path.join(
        __dirname,
        "../..",
        product.thumbnail_path
      );
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // 刪除 LightSlider 圖片檔案
    if (product.lightslider_images) {
      try {
        const lightsliderImages = JSON.parse(product.lightslider_images);
        lightsliderImages.forEach((imagePath) => {
          const fullPath = path.join(__dirname, "../..", imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      } catch (e) {
        console.error("解析 LightSlider 圖片路徑失敗:", e);
      }
    }

    const result = await run("DELETE FROM products WHERE product_id = ?", [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    res.json({ success: true, message: "商品刪除成功" });
  } catch (error) {
    console.error("刪除商品失敗:", error);
    res.status(500).json({ error: "刪除商品失敗", message: error.message });
  }
});

// 刪除商品圖片
router.delete("/:id/images", express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { imageType, imageIndex, deleteAll } = req.body;

    // 檢查商品是否存在
    const product = await get(
      "SELECT thumbnail_path, lightslider_images FROM products WHERE product_id = ?",
      [id]
    );
    if (!product) {
      return res.status(404).json({ error: "商品不存在" });
    }

    if (imageType === "thumbnail") {
      // 刪除縮圖
      if (product.thumbnail_path) {
        const thumbnailPath = path.join(
          __dirname,
          "../..",
          product.thumbnail_path
        );
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
        // 清空資料庫中的縮圖路徑
        await run(
          "UPDATE products SET thumbnail_path = NULL WHERE product_id = ?",
          [id]
        );
      }
    } else if (imageType === "lightslider") {
      // 刪除 LightSlider 圖片
      if (product.lightslider_images) {
        try {
          const lightsliderImages = JSON.parse(product.lightslider_images);

          if (deleteAll) {
            // 刪除所有 LightSlider 圖片
            lightsliderImages.forEach((imagePath) => {
              const fullPath = path.join(__dirname, "../..", imagePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            });
            // 清空資料庫中的 LightSlider 圖片路徑
            await run(
              "UPDATE products SET lightslider_images = NULL WHERE product_id = ?",
              [id]
            );
          } else if (imageIndex !== null && imageIndex !== undefined) {
            // 刪除指定索引的圖片
            if (imageIndex >= 0 && imageIndex < lightsliderImages.length) {
              const imagePath = lightsliderImages[imageIndex];
              const fullPath = path.join(__dirname, "../..", imagePath);
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }

              // 從陣列中移除該圖片
              lightsliderImages.splice(imageIndex, 1);

              // 更新資料庫
              const updatedImagesJson = JSON.stringify(lightsliderImages);
              await run(
                "UPDATE products SET lightslider_images = ? WHERE product_id = ?",
                [updatedImagesJson, id]
              );
            } else {
              return res.status(400).json({ error: "圖片索引無效" });
            }
          }
        } catch (e) {
          console.error("解析 LightSlider 圖片路徑失敗:", e);
          return res.status(500).json({ error: "處理圖片路徑失敗" });
        }
      }
    } else {
      return res.status(400).json({ error: "無效的圖片類型" });
    }

    res.json({ success: true, message: "圖片刪除成功" });
  } catch (error) {
    console.error("刪除圖片失敗:", error);
    res.status(500).json({ error: "刪除圖片失敗", message: error.message });
  }
});

module.exports = router;
