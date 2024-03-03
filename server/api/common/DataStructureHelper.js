export function createDataTree(dataset, idProperty, parentIdProperty, sortFunction = sortThuTu) {
  const hashTable = Object.create(null);
  dataset.forEach(aData => hashTable[aData[idProperty]] = { ...aData, children: [] });
  const dataTree = [];
  dataset.forEach(aData => {
    if (aData[parentIdProperty] && hashTable[aData[parentIdProperty]]) {
      if (hashTable[aData[idProperty]]?.ordinal) {
        hashTable[aData[idProperty]].index = [hashTable[aData[parentIdProperty]]?.index, hashTable[aData[idProperty]]?.ordinal].join('.');
      }
      hashTable[aData[parentIdProperty]].children.push(hashTable[aData[idProperty]]);
    } else {
      if (hashTable[aData[idProperty]]?.ordinal) {
        hashTable[aData[idProperty]].index = hashTable[aData[idProperty]]?.ordinal;
      }
      dataTree.push(hashTable[aData[idProperty]]);
    }
  });
  return sortTree(dataTree, sortFunction);
}

export function sortThuTu(a, b) {
  return a.ordinal - b.ordinal;
}

export function sortTree(tree, sortFunction = sortThuTu) {
  const orgTree = tree.sort(sortFunction);
  let stackNodes = [...tree];
  while (stackNodes.length > 0) {
    const last = stackNodes.pop();
    if (last.children && last.children.length > 0) {
      last.children = last.children.sort(sortFunction);
      stackNodes.push(...last.children);
    }
  }
  return orgTree;
}


export function buildChunks(array, chunkSize = 1) {
  if (chunkSize <= 0) { // chunkSize = 0 lặp vô hạn
    chunkSize = 1;
  }
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}
