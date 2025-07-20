function updateReadIdsInStorage(storageKey, newId, maxLength = 300) {
  if (!newId) {return;}

  try {
    const stored = localStorage.getItem(storageKey);
    let ids = Array.isArray(stored) ? stored : JSON.parse(stored || '[]');

    if (!Array.isArray(ids)) {ids = [];}

    ids = ids.filter(id => id !== newId);
    ids.unshift(newId);
    ids = ids.slice(0, maxLength);

    localStorage.setItem(storageKey, JSON.stringify(ids));
    // console.log(`storage ${storageKey}: `, ids);
  } catch (err) {
    console.warn(`Failed to update ${storageKey}:`, err);
  }
}


function addContentAsRead() {

  const ftid = window.ftid;
  const itemType = window.type;
  const itemId = window.id;

  if (ftid) {
    updateReadIdsInStorage('readids', ftid);
  }

  // console.log(`itemType: ${itemType}, itemId: ${itemId}`);
  if (itemType && itemId) {
    const itemTypeId = `${itemType}${itemId}`;
    // console.log(`item type id: ${itemTypeId}`);
    updateReadIdsInStorage('ftcreadids', itemTypeId, 500);
  }

}

addContentAsRead();