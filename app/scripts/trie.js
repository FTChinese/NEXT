class TrieNode {
  constructor() {
    this.value = null;
    this.to = null;
    this.parentNode = null;
    this.children = {};
    this.isTerminating = false;
  }

  get isLeaf() {
    return Object.keys(this.children).length === 0;
  }

  add(value) {
    if (!(value in this.children)) {
      this.children[value] = new TrieNode();
      this.children[value].value = value;
      this.children[value].parentNode = this;
    }
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.wordCount = 0;
  }

  get count() {
    return this.wordCount;
  }

  insert(word, to) {
    if (word.length === 0) {return;}
    let currentNode = this.root;
    for (let i = 0; i < word.length; i++) {
      const character = word[i];
      if (character in currentNode.children) {
        currentNode = currentNode.children[character];
      } else {
        currentNode.add(character);
        currentNode = currentNode.children[character];
      }
    }
    if (!currentNode.isTerminating) {
      this.wordCount++;
      currentNode.to = to;
      currentNode.isTerminating = true;
    }
  }

  load(dict) {
    for (const [word, to] of Object.entries(dict)) {
      this.insert(word, to);
    }
  }

  findMaxMatch(string, startIndex) {
    let currentNode = this.root;
    let currentMaxMatch = null;
    for (let i = startIndex; i < string.length; i++) {
      const character = string[i];
      if (character in currentNode.children) {
        const node = currentNode.children[character];
        if (node.to) {
          currentMaxMatch = { to: node.to, index: i };
        }
        currentNode = node;
      } else {
        break;
      }
    }
    return currentMaxMatch;
  }
}
window.Trie = Trie;