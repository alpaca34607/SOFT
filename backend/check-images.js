const { query } = require('./database-adapter');

async function checkImages() {
  try {
    console.log('🔍 檢查商品圖片路徑...');
    
    const result = await query('SELECT product_id, name, thumbnail_path, lightslider_images FROM products');
    const products = result.rows || [];
    
    console.log(`\n📋 找到 ${products.length} 個商品:`);
    
    products.forEach(product => {
      console.log(`\n- ${product.product_id}: ${product.name}`);
      console.log(`  縮圖: ${product.thumbnail_path || '無'}`);
      
      if (product.lightslider_images) {
        try {
          const images = JSON.parse(product.lightslider_images);
          console.log(`  輪播圖: ${images.length}張`);
          images.forEach(img => console.log(`    ${img}`));
        } catch (e) {
          console.log(`  輪播圖: 解析失敗`);
        }
      } else {
        console.log(`  輪播圖: 無`);
      }
    });
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
  }
}

checkImages();
