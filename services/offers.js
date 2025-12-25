/**
 * Offers Service
 * Handles CRUD operations for offers and discounts
 */

class OffersService {
  constructor() {
    this.collection = 'offers';
  }

  /**
   * Get all offers
   */
  async getAllOffers() {
    try {
      const snapshot = await firebase.firestore().collection(this.collection).get();
      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      Logger.info(`Retrieved ${offers.length} offers`);
      return { success: true, data: offers };
    } catch (error) {
      Logger.error('Error getting offers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get offer by ID
   */
  async getOfferById(id) {
    try {
      const doc = await firebase.firestore().collection(this.collection).doc(id).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'Offer not found' };
    } catch (error) {
      Logger.error('Error getting offer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create new offer
   */
  async createOffer(offerData) {
    try {
      // Validate required fields
      if (!offerData.title || !offerData.shopId || !offerData.discount) {
        return { success: false, error: 'Title, shop ID, and discount are required' };
      }

      const offer = {
        title: offerData.title.trim(),
        description: offerData.description?.trim() || '',
        shopId: offerData.shopId.trim(),
        shopName: offerData.shopName?.trim() || '',
        discount: parseFloat(offerData.discount) || 0,
        discountType: offerData.discountType || 'percentage', // percentage or fixed
        productIds: offerData.productIds || [],
        validFrom: offerData.validFrom ? firebase.firestore.Timestamp.fromDate(new Date(offerData.validFrom)) : firebase.firestore.FieldValue.serverTimestamp(),
        validUntil: offerData.validUntil ? firebase.firestore.Timestamp.fromDate(new Date(offerData.validUntil)) : null,
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        imageUrl: offerData.imageUrl?.trim() || '',
        terms: offerData.terms?.trim() || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await firebase.firestore().collection(this.collection).add(offer);
      Logger.info(`Offer created: ${offer.title} (ID: ${docRef.id})`);
      return { success: true, id: docRef.id };
    } catch (error) {
      Logger.error('Error creating offer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update offer
   */
  async updateOffer(id, offerData) {
    try {
      const offer = {
        title: offerData.title?.trim() || '',
        description: offerData.description?.trim() || '',
        shopId: offerData.shopId?.trim() || '',
        shopName: offerData.shopName?.trim() || '',
        discount: offerData.discount ? parseFloat(offerData.discount) : 0,
        discountType: offerData.discountType || 'percentage',
        productIds: offerData.productIds || [],
        validFrom: offerData.validFrom ? firebase.firestore.Timestamp.fromDate(new Date(offerData.validFrom)) : null,
        validUntil: offerData.validUntil ? firebase.firestore.Timestamp.fromDate(new Date(offerData.validUntil)) : null,
        isActive: offerData.isActive !== undefined ? offerData.isActive : true,
        imageUrl: offerData.imageUrl?.trim() || '',
        terms: offerData.terms?.trim() || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Remove undefined/empty fields
      Object.keys(offer).forEach(key => {
        if (offer[key] === '' || (Array.isArray(offer[key]) && offer[key].length === 0 && key !== 'productIds')) {
          delete offer[key];
        }
      });

      await firebase.firestore().collection(this.collection).doc(id).update(offer);
      Logger.info(`Offer updated: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error updating offer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete offer
   */
  async deleteOffer(id) {
    try {
      await firebase.firestore().collection(this.collection).doc(id).delete();
      Logger.info(`Offer deleted: ${id}`);
      return { success: true };
    } catch (error) {
      Logger.error('Error deleting offer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get offers by shop
   */
  async getOffersByShop(shopId) {
    try {
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('shopId', '==', shopId)
        .where('isActive', '==', true)
        .get();
      
      const offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      Logger.info(`Retrieved ${offers.length} offers for shop: ${shopId}`);
      return { success: true, data: offers };
    } catch (error) {
      Logger.error('Error getting offers by shop:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active offers
   */
  async getActiveOffers() {
    try {
      const now = firebase.firestore.Timestamp.now();
      const snapshot = await firebase.firestore()
        .collection(this.collection)
        .where('isActive', '==', true)
        .get();
      
      const offers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(offer => {
          if (offer.validUntil) {
            return offer.validUntil.toMillis() > now.toMillis();
          }
          return true;
        });
      
      Logger.info(`Retrieved ${offers.length} active offers`);
      return { success: true, data: offers };
    } catch (error) {
      Logger.error('Error getting active offers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search offers
   */
  async searchOffers(query) {
    try {
      const allOffers = await this.getAllOffers();
      if (!allOffers.success) return allOffers;

      const searchTerm = query.toLowerCase();
      const filtered = allOffers.data.filter(offer => 
        offer.title?.toLowerCase().includes(searchTerm) ||
        offer.description?.toLowerCase().includes(searchTerm) ||
        offer.shopName?.toLowerCase().includes(searchTerm)
      );

      Logger.info(`Search "${query}" returned ${filtered.length} offers`);
      return { success: true, data: filtered };
    } catch (error) {
      Logger.error('Error searching offers:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const offersService = new OffersService();

