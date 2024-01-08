/* jshint ignore:start */

// Opens a connection to the IndexedDB
const openDB = async (dbName, storeName, version = 2) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onerror = (event) => {
      console.error(`Database error: ${event.target.errorCode}`);
      reject(event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if(!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'key' });
      }
      // Additional logic for upgrading or creating object stores can be handled here
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};
  
// Saves a key-value pair to the database
const saveToDB = async (dbName, storeName, key, value) => {
  try {
    const db = await openDB(dbName, storeName);
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put({ key: key, value: value });
  
        request.onerror = (event) => {
          console.error("Error saving data", event.target.error);
          resolve(null); // resolving with null instead of rejecting on error
        };
  
        request.onsuccess = (event) => {
          resolve(event.target.result); // might resolve with undefined or key depending on DB implementation if successful
        };
      } catch(err) {
        console.log(err);
        resolve(null);
      }
    });
  } catch (error) {
    console.error("Database access error", error);
    return null; // returning null if any error occurs while opening the database or creating a transaction
  }
};
  
  
// Retrieves a value by key from the database
const getFromDB = async (dbName, storeName, key) => {
  try {
    const db = await openDB(dbName, storeName);
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onerror = (event) => {
          console.error("Error fetching data", event.target.error);
          resolve(null);
        };

        request.onsuccess = (event) => {
          resolve(event.target.result ? event.target.result.value : null);
        };
      } catch (err) {
        console.error("Transaction or store access error", err);
        resolve(null); // resolving the promise with null if an error occurs when setting up the transaction or store
      }
    });
  } catch (error) {
    console.error("Database open error", error);
    return null; // returning null if any error occurs while opening the database
  }
};
  
  
  // // Example usage
  // (async () => {
  //   try {
  //     const dbName = "Embeddings";
  //     const storeName = "Embeddings";
  
  //     // Save a key-value pair.
  //     await saveToDB(dbName, storeName, "user2", { name: "Alan", age: 30 });
  
  //     // Retrieve the value by key.
  //     const user = await getFromDB(dbName, storeName, "user2");
  //     console.log(user); // Should log: { name: "Alan", age: 30 }
  //   } catch (error) {
  //     console.error("An error occurred:", error);
  //   }
  // })();

  /* jshint ignore:end */
  