/**
 * Authentication Service
 * Handles user authentication using Firebase Auth
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.authStateListeners = [];
  }

  /**
   * Initialize authentication state listener
   */
  init() {
    firebase.auth().onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        this.getUserRole(user.uid).then(role => {
          this.userRole = role;
          this.notifyAuthStateChange(user, role);
        });
      } else {
        this.userRole = null;
        this.notifyAuthStateChange(null, null);
      }
    });
  }

  /**
   * Get user role from Firestore
   */
  async getUserRole(uid) {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        return userDoc.data().role || 'user';
      }
      // Default role for new users
      return 'user';
    } catch (error) {
      Logger.error('Error getting user role:', error);
      return 'user';
    }
  }

  /**
   * Register new user
   */
  async register(email, password, role = 'user') {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Save user role to Firestore
      await firebase.firestore().collection('users').doc(user.uid).set({
        email: email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      Logger.info(`User registered: ${email} with role: ${role}`);
      return { success: true, user };
    } catch (error) {
      Logger.error('Registration error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const role = await this.getUserRole(user.uid);
      
      Logger.info(`User logged in: ${email} with role: ${role}`);
      return { success: true, user, role };
    } catch (error) {
      Logger.error('Login error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await firebase.auth().signOut();
      this.currentUser = null;
      this.userRole = null;
      Logger.info('User logged out');
      return { success: true };
    } catch (error) {
      Logger.error('Logout error:', error);
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user role
   */
  getCurrentUserRole() {
    return this.userRole;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.userRole === 'admin';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Notify all listeners of auth state change
   */
  notifyAuthStateChange(user, role) {
    this.authStateListeners.forEach(callback => {
      callback(user, role);
    });
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'Email is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}

// Create singleton instance
const authService = new AuthService();

