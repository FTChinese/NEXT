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
// const saveToDB = async (dbName, storeName, key, value) => {
//   try {
//     const db = await openDB(dbName, storeName);
//     return new Promise((resolve, reject) => {
//       try {
//         const transaction = db.transaction([storeName], "readwrite");
//         const store = transaction.objectStore(storeName);
//         const request = store.put({ key: key, value: value });
  
//         request.onerror = (event) => {
//           console.error("Error saving data", event.target.error);
//           resolve(null); // resolving with null instead of rejecting on error
//         };
  
//         request.onsuccess = (event) => {
//           resolve(event.target.result); // might resolve with undefined or key depending on DB implementation if successful
//         };
//       } catch(err) {
//         console.log(err);
//         resolve(null);
//       }
//     });
//   } catch (error) {
//     console.error("Database access error", error);
//     return null; // returning null if any error occurs while opening the database or creating a transaction
//   }
// };


const saveToDB = async (dbName, storeName, key, value) => {
  try {
      const db = await openDB(dbName, storeName);
      return new Promise((resolve, reject) => {
          try {
              const transaction = db.transaction([storeName], "readwrite");
              const store = transaction.objectStore(storeName);

              // Ensure the object structure matches the store's keyPath
              const data = { key: key, value: value };
              const request = store.put(data);

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

async function queryFromDB(dbName, storeName, query = {}) {
  try {
      const db = await openDB(dbName, storeName);
      return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], "readonly");
          const store = transaction.objectStore(storeName);
          const results = [];

          const request = store.openCursor();

          request.onsuccess = (event) => {
              const cursor = event.target.result;
              if (cursor) {
                  const value = cursor.value;
                  let match = true;

                  // Check each key in the query object to see if it matches the value
                  for (const key in query) {
                      if (query[key] !== value[key]) {
                          match = false;
                          break;
                      }
                  }

                  if (match) {
                      results.push(value);
                  }

                  cursor.continue(); // Move to the next record
              } else {
                  // No more records
                  resolve(results);
              }
          };

          request.onerror = (event) => {
              console.error("Error fetching data", event.target.error);
              reject(event.target.error); // Pass the error to the reject callback
          };

          transaction.onerror = (event) => {
              console.error("Transaction error", event.target.error);
              reject(event.target.error); // Pass the error to the reject callback
          };
      });
  } catch (error) {
      console.error("Database access error", error);
      return null;
  }
}

// (async () => {
//   const dbName = 'Engagement';
//   const storeName = 'DailyQuiz';

//   // Query for all records where `userId` is 'user123'
//   const pastScores = await queryFromDB(dbName, storeName, { value: 90 });
//   console.log(JSON.stringify(pastScores)); // Logs all records matching the query

//   // To get all records, just pass an empty object
//   const allScores = await queryFromDB(dbName, storeName, {});
//   console.log(JSON.stringify(allScores)); // Logs all records in the store
// })();
  
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
  