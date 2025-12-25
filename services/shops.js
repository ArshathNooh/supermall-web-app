/**
 * Shops Service
 * Handles CRUD operations for shops
 */

class ShopsService {
  constructor() {
    this.collection = 'shops';
  }

  /**
   * Get all shops
   */
  async getAllShops() {
    try {
      const snapshot = await firebase.firestore().collection(this.collection).get();
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      Logger.info(`Retrieved ${shops.length} shops`);
      return { success: true, data: shops };
    } catch (error) {
      Logger.error('Error getting shops:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get shop by ID
   */
  async getShopById(id) {
    try {
      const doc = await firebase.firestore().collection(this.collection).doc(id).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'Shop not found' };
    } catch (error) {
      Logger.error('Error getting shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new shop
   */
  async createShop(shopData) {
    try {
      // Validate required fields
      if (!shopData.name || !shopData.floor || !shopData.category) {
        return { success: false, error: 'Name, floor, and category are required' };
      }

      const shop = {
        name: shopData.name.trim(),
        description: shopData.description?.trim() || '',
        floor: shopData.floor.trim(),
        category: shopData.category.trim(),
        location: shopData.location?.trim() || '',
        contact: shopData.contact?.trim() || '',
        email: shopData.email?.trim() || '',
        openingHours: shopData.openingHours?.trim() || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firebase.firestore().collection(this.collection).add(shop);
      Logger.info(`Shop created: ${shop.name} (ID: ${docRef.id})`);
      return { success: true, id: docRef.id };
    } catch (error) {
      Logger.error('Error creating shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update shop
   */
  async updateShop(id, shopData) {
    try {
      const shop = {
        name: shopData.name?.trim() || '',
        description: shopData.description?.trim() || '',
        floor: shopData.floor?.trim() || '',
        category: shopData.category?.trim() || '',
        location: shopData.location?.trim() || '',
        contact: shopData.contact?.trim() || '',
        email: shopData.email?.trim() || '',
        openingHours: shopData.openingHours?.trim() || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Remove undefined fields
      Object.keys(shop).forEach(key => shop[key] === '' && delete shop[key]);

      await firebase.firestore().collection(this.collection).doc(id).update(shop);
      Logger.info(`Shop updated: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error updating shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete shop
   */
  async deleteShop(id) {
    try {
      await firebase.firestore().collection(this.collection).doc(id).delete();
      Logger.info(`Shop deleted: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error deleting shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get shops by floor
   */
  async getShopsByFloor(floor) {
    try {
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('floor', '==', floor)
        .get();
      
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Logger.info(`Retrieved ${shops.length} shops for floor: ${floor}`);
      return { success: true, data: shops };
    } catch (error) {
      Logger.error('Error getting shops by floor:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get shops by category
   */
  async getShopsByCategory(category) {
    try {
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('category', '==', category)
        .get();
      
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Logger.info(`Retrieved ${shops.length} shops for category: ${category}`);
      return { success: true, data: shops };
    } catch (error) {
      Logger.error('Error getting shops by category:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search shops
   */
  async searchShops(query) {
    try {
      const allShops = await this.getAllShops();
      if (!allShops.success) return allShops;

      const searchTerm = query.toLowerCase();
      const filtered = allShops.data.filter(shop => 
        shop.name?.toLowerCase().includes(searchTerm) ||
        shop.description?.toLowerCase().includes(searchTerm) ||
        shop.category?.toLowerCase().includes(searchTerm) ||
        shop.floor?.toLowerCase().includes(searchTerm)
      );

      Logger.info(`Search "${query}" returned ${filtered.length} shops`);
      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Error searching shops:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const shopsService = new ShopsService();

