const { query, run } = require('./database-adapter');

async function initProducts() {
  try {
    console.log('🔄 初始化商品資料...');
    
    // 檢查是否已有商品資料
    const existingProducts = await query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count > 0) {
      console.log(`✅ 已有 ${existingProducts[0].count} 個商品，跳過初始化`);
      return;
    }
    
    // 商品資料
    const products = [
      {
        product_id: 'product-Remain',
        name: '餘量釋出|軟吉拉公仔',
        price: 1200,
        deposit: 300,
        max_quantity: 3,
        status: 'available',
        preorder_button_status: 'select_style',
        cell_open_status: 'preparing',
        cell_remaining_status: 'still_available',
        specifications: '3D列印手工打磨噴色製作',
        pickup_info: '展場取貨為主，請考量自身是否方便前往展場繳納尾款並取貨',
        thumbnail_path: '/images/shop/product-Softzilla-bluewhite-front.jpg',
        lightslider_images: JSON.stringify([
          '/images/shop/product-Softzilla-bluewhite-front.jpg',
          '/images/shop/product-Softzilla-bluewhite-back.jpg',
          '/images/shop/product-Softzilla-blueblack-front.jpg',
          '/images/shop/product-Softzilla-blueblack-back.jpg',
          '/images/shop/product-Softzilla-redblack.jpg',
          '/images/shop/product-Softzilla-greenblack.jpg',
        ]),
        sketchfab_embed_link: 'https://sketchfab.com/models/b70dd5e325d04d17929dd6ff7bd222b0/embed',
        sketchfab_background: '/images/shop/Softzilla-longAD.jpg',
        main_colors: JSON.stringify(['#4A90E2', '#000000', '#FF0000', '#00FF00']),
        sub_colors: JSON.stringify(['#FFFFFF', '#CCCCCC'])
      },
      {
        product_id: 'product-Soft',
        name: '2019出品 | 軟筋臥佛公仔',
        price: 800,
        deposit: 200,
        max_quantity: 3,
        status: 'available',
        preorder_button_status: 'select_style',
        cell_open_status: 'preparing',
        cell_remaining_status: 'still_available',
        specifications: '3D列印手工打磨噴色製作',
        pickup_info: '展場取貨為主',
        thumbnail_path: '/images/shop/product-Soft-front.jpg',
        lightslider_images: JSON.stringify([
          '/images/shop/product-Soft-front.jpg',
          '/images/shop/product-Soft-back.jpg',
        ]),
        sketchfab_embed_link: 'https://sketchfab.com/models/7b4108446c8949cf839a21f37ff261fa/embed',
        sketchfab_background: '/images/shop/Softzilla-longAD-2.jpg',
        main_colors: JSON.stringify(['#FFD700', '#8B4513']),
        sub_colors: JSON.stringify(['#FFFFFF', '#CCCCCC'])
      },
      {
        product_id: 'product-SoftzillaOD',
        name: '監修中 | 戶外風軟吉拉',
        price: 1500,
        deposit: 400,
        max_quantity: 3,
        status: 'available',
        preorder_button_status: 'select_style',
        cell_open_status: 'preparing',
        cell_remaining_status: 'still_available',
        specifications: '3D列印手工打磨噴色製作',
        pickup_info: '展場取貨為主',
        thumbnail_path: '/images/shop/product-SoftzillaOD-front.jpg',
        lightslider_images: JSON.stringify([
          '/images/shop/product-SoftzillaOD-front.jpg',
          '/images/shop/product-SoftzillaOD-back.jpg',
        ]),
        sketchfab_embed_link: 'https://sketchfab.com/models/534a5772046a4ad594d8aba768421f3d/embed',
        sketchfab_background: '/images/shop/Sketchfab_background.jpg',
        main_colors: JSON.stringify(['#228B22', '#8B4513']),
        sub_colors: JSON.stringify(['#FFFFFF', '#CCCCCC'])
      },
      {
        product_id: 'product-Softtwice',
        name: '2018出品 | 小貓仔黏土偶',
        price: 600,
        deposit: 150,
        max_quantity: 3,
        status: 'available',
        preorder_button_status: 'select_style',
        cell_open_status: 'preparing',
        cell_remaining_status: 'still_available',
        specifications: '3D列印手工打磨噴色製作',
        pickup_info: '展場取貨為主',
        thumbnail_path: '/images/shop/product-soft-twice.JPG',
        lightslider_images: JSON.stringify([
          '/images/shop/product-soft-twice.JPG',
        ]),
        sketchfab_embed_link: '',
        sketchfab_background: '',
        main_colors: JSON.stringify(['#FF69B4', '#FFB6C1']),
        sub_colors: JSON.stringify(['#FFFFFF', '#CCCCCC'])
      },
      {
        product_id: 'product-Softzilla',
        name: '2023出品|軟吉拉公仔',
        price: 1000,
        deposit: 250,
        max_quantity: 3,
        status: 'available',
        preorder_button_status: 'select_style',
        cell_open_status: 'preparing',
        cell_remaining_status: 'still_available',
        specifications: '3D列印手工打磨噴色製作',
        pickup_info: '展場取貨為主',
        thumbnail_path: '/images/products/thumbnail-1757659715373-201897359.jpg',
        lightslider_images: JSON.stringify([
          '/images/products/lightslider_images-1757659137467-889919293.jpg',
          '/images/products/lightslider_images-1757659137468-906267882.jpg',
          '/images/products/lightslider_images-1757659137469-921066150.jpg',
          '/images/products/lightslider_images-1757659137470-285483514.jpg',
          '/images/products/lightslider_images-1757659137470-810128025.jpg',
          '/images/products/lightslider_images-1757659137473-425415864.jpg',
        ]),
        sketchfab_embed_link: '',
        sketchfab_background: '/images/products/sketchfab_background-1757659137474-267403115.jpg',
        product_introduction: '/images/products/product_introduction-1757659137476-10238190.jpg',
        preorder_notes: '/images/products/preorder_notes-1757659137479-990608779.jpg',
        main_colors: JSON.stringify(['#4A90E2', '#000000', '#FF0000', '#00FF00']),
        sub_colors: JSON.stringify(['#FFFFFF', '#CCCCCC'])
      }
    ];
    
    // 插入商品資料
    for (const product of products) {
      await run(`
        INSERT INTO products (
          product_id, name, price, deposit, max_quantity, status,
          preorder_button_status, cell_open_status, cell_remaining_status,
          specifications, pickup_info, thumbnail_path, lightslider_images,
          sketchfab_embed_link, sketchfab_background, product_introduction, preorder_notes,
          main_colors, sub_colors
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.product_id,
        product.name,
        product.price,
        product.deposit,
        product.max_quantity,
        product.status,
        product.preorder_button_status,
        product.cell_open_status,
        product.cell_remaining_status,
        product.specifications,
        product.pickup_info,
        product.thumbnail_path,
        product.lightslider_images,
        product.sketchfab_embed_link,
        product.sketchfab_background,
        product.product_introduction,
        product.preorder_notes,
        product.main_colors,
        product.sub_colors
      ]);
      
      console.log(`✅ 已插入商品: ${product.name}`);
    }
    
    console.log(`🎉 成功初始化 ${products.length} 個商品！`);
    
  } catch (error) {
    console.error('❌ 初始化商品失敗:', error);
    throw error;
  }
}

initProducts();
