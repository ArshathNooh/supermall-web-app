/**
 * Products Service
 * Handles CRUD operations for products
 */

class ProductsService {
  constructor() {
    this.collection = 'products';
  }

  /**
   * Get all products
   */
  async getAllProducts() {
    try {
      const snapshot = await firebase.firestore().collection(this.collection).get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      Logger.info(`Retrieved ${products.length} products`);
      return { success: true, data: products };
    } catch (error) {
      Logger.error('Error getting products:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    try {
      const doc = await firebase.firestore().collection(this.collection).doc(id).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'Product not found' };
    } catch (error) {
      Logger.error('Error getting product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    try {
      // Validate required fields
      if (!productData.name || !productData.shopId || !productData.price) {
        return { success: false, error: 'Name, shop ID, and price are required' };
      }

      const product = {
        name: productData.name.trim(),
        description: productData.description?.trim() || '',
        shopId: productData.shopId.trim(),
        shopName: productData.shopName?.trim() || '',
        price: parseFloat(productData.price) || 0,
        category: productData.category?.trim() || '',
        brand: productData.brand?.trim() || '',
        features: productData.features || [],
        imageUrl: productData.imageUrl?.trim() || '',
        inStock: productData.inStock !== undefined ? productData.inStock : true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firebase.firestore().collection(this.collection).add(product);
      Logger.info(`Product created: ${product.name} (ID: ${docRef.id})`);
      return { success: true, id: docRef.id };
    } catch (error) {
      Logger.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update product
   */
  async updateProduct(id, productData) {
    try {
      const product = {
        name: productData.name?.trim() || '',
        description: productData.description?.trim() || '',
        shopId: productData.shopId?.trim() || '',
        shopName: productData.shopName?.trim() || '',
        price: productData.price ? parseFloat(productData.price) : 0,
        category: productData.category?.trim() || '',
        brand: productData.brand?.trim() || '',
        features: productData.features || [],
        imageUrl: productData.imageUrl?.trim() || '',
        inStock: productData.inStock !== undefined ? productData.inStock : true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Remove undefined/empty fields
      Object.keys(product).forEach(key => {
        if (product[key] === '' || (Array.isArray(product[key]) && product[key].length === 0)) {
          delete product[key];
        }
      });

      await firebase.firestore().collection(this.collection).doc(id).update(product);
      Logger.info(`Product updated: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    try {
      await firebase.firestore().collection(this.collection).doc(id).delete();
      Logger.info(`Product deleted: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get products by shop
   */
  async getProductsByShop(shopId) {
    try {
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('shopId', '==', shopId)
        .get();
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Logger.info(`Retrieved ${products.length} products for shop: ${shopId}`);
      return { success: true, data: products };
    } catch (error) {
      Logger.error('Error getting products by shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    try {
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('category', '==', category)
        .get();
      
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Logger.info(`Retrieved ${products.length} products for category: ${category}`);
      return { success: true, data: products };
    } catch (error) {
      Logger.error('Error getting products by category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search products
   */
  async searchProducts(query) {
    try {
      const allProducts = await this.getAllProducts();
      if (!allProducts.success) return allProducts;

      const searchTerm = query.toLowerCase();
      const filtered = allProducts.data.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category?.toLowerCase().includes(searchTerm) ||
        product.shopName?.toLowerCase().includes(searchTerm)
      );

      Logger.info(`Search "${query}" returned ${filtered.length} products`);
      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Filter products by price range
   */
  async filterProductsByPrice(minPrice, maxPrice) {
    try {
      const allProducts = await this.getAllProducts();
      if (!allProducts.success) return allProducts;

      const filtered = allProducts.data.filter(product => {
        const price = product.price || 0;
        return price >= minPrice && price <= maxPrice;
      });

      Logger.info(`Price filter returned ${filtered.length} products`);
      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Error filtering products by price:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Compare products
   */
  async compareProducts(productIds) {
    try {
      const products = [];
      for (const id of productIds) {
        const result = await this.getProductById(id);
        if (result.success) {
          products.push(result.data);
        }
      }
      Logger.info(`Comparing ${products.length} products`);
      return { success: true, data: products };
    } catch (error) {
      Logger.error('Error comparing products:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const productsService = new ProductsService();

