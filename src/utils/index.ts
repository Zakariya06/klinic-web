/**
 * Standard Web Store using localStorage.
 * Logic remains identical to your previous implementation but optimized for Web.
 */
class Store {
  async get(key: string): Promise<string | null> {
    try {
      // Standard web localStorage (Synchronous, but wrapped in Promise to match your API)
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error retrieving item with key "${key}":`, error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item with key "${key}":`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting item with key "${key}":`, error);
    }
  }

  /**
   * Optional: Clear everything
   */
  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing store:", error);
    }
  }
}

// Export a singleton instance just like before
export const store = new Store();

/**
 * Auth actions
 */
export const logout = async () => {
  await store.delete('token');
};

// Re-exporting your debounce utility
export { debounce } from './debounce';