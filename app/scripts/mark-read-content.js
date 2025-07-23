function updateReadIdsInStorage(storageKey, newId, maxLength = 300) {
  if (!newId) {return;}

  try {
    const stored = localStorage.getItem(storageKey);
    let ids = Array.isArray(stored) ? stored : JSON.parse(stored || '[]');

    if (!Array.isArray(ids)) {ids = [];}

    const cleanedId = newId.replace(/^content/g, '');
    ids = ids.filter(id => id !== cleanedId);
    ids.unshift(cleanedId);
    ids = ids.slice(0, maxLength);

    localStorage.setItem(storageKey, JSON.stringify(ids));
    // console.log(`id ${cleanedId} added to ${storageKey}`);
    // console.log(`storage ${storageKey} first: `, ids[0]);
  } catch (err) {
    console.warn(`Failed to update ${storageKey}:`, err);
  }
}


function addContentAsRead() {

  const ftid = window.ftid;
  const itemType = window.type;
  const itemId = window.id;

  const upLimit = 500;

  if (ftid) {
    updateReadIdsInStorage('readids', ftid, upLimit);
  }

  // console.log(`itemType: ${itemType}, itemId: ${itemId}`);
  if (itemType && itemId) {
    const itemTypeId = `${itemType}${itemId}`;
    // console.log(`item type id: ${itemTypeId}`);
    if (itemType === 'content') {
      updateReadIdsInStorage('readids', itemId, upLimit);
    } else {
      updateReadIdsInStorage('ftcreadids', itemTypeId, upLimit);
    }
  }

}

addContentAsRead();