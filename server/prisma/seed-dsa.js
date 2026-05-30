var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning DSA course if exists...');
  var existing = await prisma.course.findFirst({ where: { title: { contains: "Data Structures" } } });
  if (existing) {
    await prisma.topic.deleteMany({ where: { module: { courseId: existing.id } } });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
  }

  var c = await prisma.course.create({
    data: {
      title: "Data Structures & Algorithms",
      description: "Master DSA for technical interviews. Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and more.",
      category: "Computer Science",
      difficulty: "Advanced",
      duration: "25 hours",
      totalModules: 5,
      accentColor: "#EF4444",
      icon: "🧮",
      thumbnailUrl: "https://img.youtube.com/vi/8hly31xKli0/0.jpg"
    }
  });
  console.log('✅ Course: ' + c.id);

  // MODULE 1: Arrays & Strings
  var m1 = await prisma.module.create({
    data: { courseId: c.id, title: "Arrays & Strings", orderIndex: 1, duration: "5h", description: "Array operations, two pointers, sliding window, string manipulation.", videoUrl: "8hly31xKli0", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m1.id, title: "Arrays Introduction", contentType: "video", content: "8hly31xKli0", orderIndex: 1, duration: "25 min" },
    { moduleId: m1.id, title: "Arrays & Strings Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Arrays & Strings

### Array Basics
\`\`\`js
// Declaration
const arr = [1, 2, 3, 4, 5];
const matrix = [[1,2],[3,4],[5,6]];

// Common Operations
arr.push(6);        // Add to end
arr.pop();          // Remove from end
arr.unshift(0);     // Add to start
arr.shift();        // Remove from start
arr.slice(1, 3);    // [2, 3]
arr.splice(2, 1);    // Remove at index 2
\`\`\`

### Two Pointer Technique
\`\`\`js
// Reverse array
function reverse(arr) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  return arr;
}

// Pair sum
function findPair(arr, target) {
  let left = 0, right = arr.length - 1;
  arr.sort((a,b) => a - b);
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [arr[left], arr[right]];
    sum < target ? left++ : right--;
  }
  return null;
}
\`\`\`

### Sliding Window
\`\`\`js
// Max subarray sum of size k
function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
\`\`\`

### String Manipulation
\`\`\`js
const str = "Hello World";
str.length;           // 11
str.charAt(0);        // 'H'
str.substring(0, 5);  // 'Hello'
str.split(' ');       // ['Hello', 'World']
str.toLowerCase();    // 'hello world'
str.includes('World'); // true
str.replace('World', 'JS'); // 'Hello JS'
\`\`\`

### Common Array Patterns
| Pattern | Use Case |
|---------|----------|
| Two Pointers | Sorted arrays, palindrome |
| Sliding Window | Subarrays, substrings |
| Prefix Sum | Range sum queries |
| Binary Search | Sorted arrays |
\`\`\`
` },
    { moduleId: m1.id, title: "Two Pointers Practice", contentType: "coding",
      codeTemplate: `// Find if array has pair with given sum
function hasPairWithSum(arr, target) {
  const seen = new Set();
  for (let num of arr) {
    if (seen.has(target - num)) return true;
    seen.add(num);
  }
  return false;
}

console.log(hasPairWithSum([1, 2, 4, 4], 8)); // true
console.log(hasPairWithSum([1, 2, 3, 9], 8)); // false`,
      orderIndex: 3, duration: "20 min" }
  ]});

  // MODULE 2: Linked Lists
  var m2 = await prisma.module.create({
    data: { courseId: c.id, title: "Linked Lists", orderIndex: 2, duration: "5h", description: "Singly, doubly linked lists, fast and slow pointers.", videoUrl: "Hj_rA0dhr2I", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m2.id, title: "Linked List Basics", contentType: "video", content: "Hj_rA0dhr2I", orderIndex: 1, duration: "30 min" },
    { moduleId: m2.id, title: "Linked List Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Linked Lists

### Node Structure
\`\`\`js
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  add(value) {
    const node = new Node(value);
    if (!this.head) { this.head = node; }
    else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.size++;
  }
}
\`\`\`

### Common Operations
\`\`\`js
// Reverse a linked list
function reverse(head) {
  let prev = null, current = head;
  while (current) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}

// Detect cycle (Floyd's Algorithm)
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Find middle
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}
\`\`\`

### Time Complexity
| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access | O(1) | O(n) |
| Insert (start) | O(n) | O(1) |
| Insert (end) | O(1) | O(n) |
| Delete | O(n) | O(1)* |
\`\`\`
` },
    { moduleId: m2.id, title: "Reverse Linked List", contentType: "coding",
      codeTemplate: `class Node {
  constructor(val) { this.val = val; this.next = null; }
}

function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

// Test
let head = new Node(1);
head.next = new Node(2);
head.next.next = new Node(3);
console.log('Original: 1->2->3');
let reversed = reverseList(head);
console.log('Reversed: 3->2->1');`,
      orderIndex: 3, duration: "25 min" }
  ]});

  // MODULE 3: Trees & Graphs
  var m3 = await prisma.module.create({
    data: { courseId: c.id, title: "Trees & Graphs", orderIndex: 3, duration: "6h", description: "Binary trees, BST, BFS, DFS, graph traversal.", videoUrl: "tWVWeAqZ0WU", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m3.id, title: "Binary Trees", contentType: "video", content: "tWVWeAqZ0WU", orderIndex: 1, duration: "30 min" },
    { moduleId: m3.id, title: "Trees & Graphs Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Trees & Graphs

### Binary Tree Node
\`\`\`js
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
\`\`\`

### Tree Traversals
\`\`\`js
// Inorder: Left -> Root -> Right
function inorder(root) {
  if (!root) return;
  inorder(root.left);
  console.log(root.val);
  inorder(root.right);
}

// Preorder: Root -> Left -> Right
function preorder(root) {
  if (!root) return;
  console.log(root.val);
  preorder(root.left);
  preorder(root.right);
}

// Postorder: Left -> Right -> Root
function postorder(root) {
  if (!root) return;
  postorder(root.left);
  postorder(root.right);
  console.log(root.val);
}
\`\`\`

### BFS (Level Order)
\`\`\`js
function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [], size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
\`\`\`

### Graph DFS
\`\`\`js
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  for (let neighbor of graph[start]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
}
\`\`\`

### Traversal Comparison
| Algorithm | Data Structure | Use Case |
|-----------|---------------|----------|
| DFS | Stack (recursion) | Path finding |
| BFS | Queue | Shortest path |
| Inorder | Recursion | BST sorted order |
\`\`\`
` },
    { moduleId: m3.id, title: "Tree Traversal", contentType: "coding",
      codeTemplate: `class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

// Create tree:    1
//               /   \\
//              2     3
//             / \\   / \\
//            4   5 6   7
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

function dfs(node) {
  if (!node) return;
  console.log(node.val);
  dfs(node.left);
  dfs(node.right);
}

console.log('DFS Traversal:');
dfs(root);`,
      orderIndex: 3, duration: "25 min" }
  ]});

  // MODULE 4: Dynamic Programming
  var m4 = await prisma.module.create({
    data: { courseId: c.id, title: "Dynamic Programming", orderIndex: 4, duration: "5h", description: "Memoization, tabulation, knapsack, LCS, LIS.", videoUrl: "oBt53YbR9Kk", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m4.id, title: "DP Introduction", contentType: "video", content: "oBt53YbR9Kk", orderIndex: 1, duration: "30 min" },
    { moduleId: m4.id, title: "DP Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## Dynamic Programming

### What is DP?
Breaking down a problem into **smaller overlapping subproblems** and storing their results to avoid recomputation.

### Two Approaches
| Approach | Method | Direction |
|----------|--------|-----------|
| Memoization | Top-down (recursion + cache) | From problem to base |
| Tabulation | Bottom-up (iteration) | From base to problem |

### Fibonacci Example
\`\`\`js
// Memoization (Top-down)
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fib(n-1, memo) + fib(n-2, memo);
  return memo[n];
}

// Tabulation (Bottom-up)
function fibDP(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}
\`\`\`

### Climbing Stairs
\`\`\`js
// You can climb 1 or 2 steps. How many ways to reach n?
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    let curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
\`\`\`

### Common DP Patterns
| Pattern | Example Problems |
|---------|-----------------|
| 0/1 Knapsack | Subset sum, Partition |
| Unbounded Knapsack | Coin change |
| LCS | Edit distance |
| LIS | Longest increasing |
| Matrix Chain | Palindrome partition |
\`\`\`
` },
    { moduleId: m4.id, title: "Fibonacci with DP", contentType: "coding",
      codeTemplate: `// Fibonacci with DP (Tabulation)
function fibonacci(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}

console.log('Fib(10):', fibonacci(10)); // 55
console.log('Fib(20):', fibonacci(20)); // 6765`,
      orderIndex: 3, duration: "20 min" }
  ]});

  // MODULE 5: Sorting & Searching
  var m5 = await prisma.module.create({
    data: { courseId: c.id, title: "Sorting & Searching", orderIndex: 5, duration: "4h", description: "Quick sort, merge sort, binary search variations.", videoUrl: "8hly31xKli0", videoDuration: 2400 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m5.id, title: "Sorting Algorithms", contentType: "video", content: "8hly31xKli0", orderIndex: 1, duration: "30 min" },
    { moduleId: m5.id, title: "Sorting Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Sorting & Searching

### Quick Sort
\`\`\`js
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}
\`\`\`

### Merge Sort
\`\`\`js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  while (left.length && right.length) {
    result.push(left[0] < right[0] ? left.shift() : right.shift());
  }
  return [...result, ...left, ...right];
}
\`\`\`

### Binary Search
\`\`\`js
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    arr[mid] < target ? left = mid + 1 : right = mid - 1;
  }
  return -1;
}
\`\`\`

### Complexity Comparison
| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |
\`\`\`
` },
    { moduleId: m5.id, title: "Binary Search", contentType: "coding",
      codeTemplate: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13, 15];
console.log('Index of 7:', binarySearch(arr, 7));  // 3
console.log('Index of 10:', binarySearch(arr, 10)); // -1`,
      orderIndex: 3, duration: "20 min" }
  ]});

  console.log('✅ Data Structures & Algorithms course created!');
  console.log('   Course ID: ' + c.id);
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });