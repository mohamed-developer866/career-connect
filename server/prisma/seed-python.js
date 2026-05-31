var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning Python course if exists...');
  var existing = await prisma.course.findFirst({ where: { title: { contains: "Python" } } });
  if (existing) {
    await prisma.topic.deleteMany({ where: { module: { courseId: existing.id } } });
    await prisma.module.deleteMany({ where: { courseId: existing.id } });
    await prisma.course.delete({ where: { id: existing.id } });
  }

  var c = await prisma.course.create({
    data: {
      title: "Python for Data Science",
      description: "Master Python programming, Pandas, NumPy, Matplotlib, and Machine Learning basics for data analysis and AI.",
      category: "Data Science",
      difficulty: "Beginner",
      duration: "20 hours",
      totalTopics: 4,
      accentColor: "#8B5CF6",
      icon: "🐍",
      thumbnailUrl: "https://img.youtube.com/vi/rfscVS0vtbw/0.jpg"
    }
  });
  console.log('✅ Course: ' + c.id);

  // MODULE 1
  var m1 = await prisma.module.create({
    data: { courseId: c.id, title: "Python Fundamentals", orderIndex: 1, duration: "5h", description: "Syntax, variables, data types, loops, and functions.", videoUrl: "rfscVS0vtbw", videoDuration: 2700 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m1.id, title: "Getting Started with Python", contentType: "video", content: "rfscVS0vtbw", orderIndex: 1, duration: "20 min" },
    { moduleId: m1.id, title: "Python Basics Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Python Fundamentals

### Variables & Data Types
\`\`\`python
# Numbers
age = 25
price = 19.99

# Strings
name = "John"
message = 'Hello, World!'

# Lists
fruits = ["apple", "banana", "orange"]
fruits.append("grape")

# Dictionaries
person = {"name": "John", "age": 25, "city": "Chennai"}
print(person["name"])

# Tuples (immutable)
colors = ("red", "green", "blue")
\`\`\`

### Control Flow
\`\`\`python
# If-else
score = 85
if score >= 90:
    print("A")
elif score >= 80:
    print("B")
else:
    print("C")

# For loop
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# While loop
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

### Functions
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

def add(a, b):
    return a + b

# Lambda functions
square = lambda x: x ** 2
print(square(5))  # 25

# Default parameters
def power(base, exp=2):
    return base ** exp
\`\`\`

### List Comprehension
\`\`\`python
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
evens = [x for x in numbers if x % 2 == 0]
\`\`\`
` },
    { moduleId: m1.id, title: "Functions & OOP", contentType: "video", content: "rfscVS0vtbw", orderIndex: 3, duration: "25 min" },
    { moduleId: m1.id, title: "Write Python Functions", contentType: "coding",
      codeTemplate: `def calculate_stats(numbers):
    total = sum(numbers)
    average = total / len(numbers)
    maximum = max(numbers)
    minimum = min(numbers)
    return {"total": total, "average": average, "max": maximum, "min": minimum}

data = [10, 20, 30, 40, 50]
result = calculate_stats(data)
print(result)`,
      orderIndex: 4, duration: "15 min" }
  ]});

  // MODULE 2
  var m2 = await prisma.module.create({
    data: { courseId: c.id, title: "NumPy & Pandas", orderIndex: 2, duration: "6h", description: "Data manipulation with NumPy arrays and Pandas DataFrames.", videoUrl: "vmEHCJofslg", videoDuration: 3600 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m2.id, title: "NumPy Arrays", contentType: "video", content: "vmEHCJofslg", orderIndex: 1, duration: "30 min" },
    { moduleId: m2.id, title: "NumPy & Pandas Guide", contentType: "cheatsheet", orderIndex: 2, duration: "20 min",
      content: `## NumPy & Pandas

### NumPy Basics
\`\`\`python
import numpy as np

# Create arrays
arr = np.array([1, 2, 3, 4, 5])
zeros = np.zeros((3, 3))
ones = np.ones((2, 4))
random_arr = np.random.rand(3, 3)

# Array operations
arr * 2          # [2, 4, 6, 8, 10]
arr.sum()        # 15
arr.mean()       # 3.0
arr.max()        # 5
arr.reshape(5,1) # Reshape to 5x1

# Indexing
print(arr[0])    # 1
print(arr[1:4])  # [2, 3, 4]
\`\`\`

### Pandas DataFrame
\`\`\`python
import pandas as pd

# Create DataFrame
data = {
    'Name': ['John', 'Anna', 'Peter'],
    'Age': [25, 30, 35],
    'City': ['NYC', 'London', 'Tokyo']
}
df = pd.DataFrame(data)

# Read CSV
df = pd.read_csv('data.csv')

# Basic operations
df.head()        # First 5 rows
df.info()        # Column info
df.describe()    # Statistics
df['Age'].mean() # Average age

# Filtering
adults = df[df['Age'] > 25]
nyc_people = df[df['City'] == 'NYC']

# Group by
df.groupby('City')['Age'].mean()

# Add column
df['Salary'] = [50000, 60000, 70000]
\`\`\`

### Common Operations
\`\`\`python
# Handle missing values
df.dropna()           # Remove rows with NaN
df.fillna(0)          # Replace NaN with 0

# Sorting
df.sort_values('Age', ascending=False)

# Merge DataFrames
merged = pd.merge(df1, df2, on='id')
\`\`\`
` },
    { moduleId: m2.id, title: "Data Analysis Project", contentType: "coding",
      codeTemplate: `import pandas as pd
import numpy as np

# Create sample data
data = {
    'Student': ['A', 'B', 'C', 'D', 'E'],
    'Math': [85, 92, 78, 88, 95],
    'Science': [90, 85, 82, 91, 89],
    'English': [78, 88, 85, 80, 92]
}
df = pd.DataFrame(data)

# Analysis
df['Average'] = (df['Math'] + df['Science'] + df['English']) / 3
df['Grade'] = df['Average'].apply(lambda x: 'A' if x >= 90 else 'B' if x >= 80 else 'C')

print(df)
print('\\nClass Average:', df['Average'].mean())`,
      orderIndex: 3, duration: "30 min" }
  ]});

  // MODULE 3
  var m3 = await prisma.module.create({
    data: { courseId: c.id, title: "Data Visualization", orderIndex: 3, duration: "5h", description: "Matplotlib and Seaborn for stunning charts.", videoUrl: "UO98lJQ3QGI", videoDuration: 3000 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m3.id, title: "Matplotlib Basics", contentType: "video", content: "UO98lJQ3QGI", orderIndex: 1, duration: "25 min" },
    { moduleId: m3.id, title: "Visualization Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Data Visualization

### Matplotlib
\`\`\`python
import matplotlib.pyplot as plt

# Line plot
x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]
plt.plot(x, y, marker='o', color='blue')
plt.title('Line Plot')
plt.xlabel('X Axis')
plt.ylabel('Y Axis')
plt.show()

# Bar chart
categories = ['A', 'B', 'C', 'D']
values = [23, 45, 56, 78]
plt.bar(categories, values, color=['red', 'blue', 'green', 'purple'])
plt.show()

# Pie chart
sizes = [30, 25, 25, 20]
labels = ['Python', 'Java', 'C++', 'JS']
plt.pie(sizes, labels=labels, autopct='%1.1f%%')
plt.show()

# Scatter plot
x = np.random.rand(50)
y = np.random.rand(50)
plt.scatter(x, y, alpha=0.7, c='green')
plt.show()
\`\`\`

### Seaborn
\`\`\`python
import seaborn as sns

# Heatmap
data = np.random.rand(5, 5)
sns.heatmap(data, annot=True, cmap='coolwarm')
plt.show()

# Box plot
sns.boxplot(x='Category', y='Value', data=df)
plt.show()

# Pair plot
sns.pairplot(df)
plt.show()
\`\`\`
` },
    { moduleId: m3.id, title: "Create Charts", contentType: "coding",
      codeTemplate: `import matplotlib.pyplot as plt

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
sales = [12000, 15000, 13000, 18000, 20000]

plt.figure(figsize=(10, 5))
plt.bar(months, sales, color='#6c47ff')
plt.title('Monthly Sales Report', fontsize=16)
plt.xlabel('Month')
plt.ylabel('Sales ($)')
plt.show()`,
      orderIndex: 3, duration: "20 min" }
  ]});

  // MODULE 4
  var m4 = await prisma.module.create({
    data: { courseId: c.id, title: "Machine Learning Basics", orderIndex: 4, duration: "4h", description: "Scikit-learn, regression, classification.", videoUrl: "7eh4d6sabA0", videoDuration: 2400 }
  });
  await prisma.topic.createMany({ data: [
    { moduleId: m4.id, title: "ML Introduction", contentType: "video", content: "7eh4d6sabA0", orderIndex: 1, duration: "30 min" },
    { moduleId: m4.id, title: "ML Guide", contentType: "cheatsheet", orderIndex: 2, duration: "15 min",
      content: `## Machine Learning with Scikit-Learn

### Installation
\`\`\`bash
pip install scikit-learn pandas numpy
\`\`\`

### Linear Regression
\`\`\`python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

X = df[['feature1', 'feature2']]
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
score = model.score(X_test, y_test)
print(f'Accuracy: {score:.2f}')
\`\`\`

### Classification
\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
pred = model.predict(X_test)
accuracy = accuracy_score(y_test, pred)
\`\`\`

### Key ML Algorithms
| Algorithm | Type | Use Case |
|-----------|------|----------|
| Linear Regression | Regression | Price prediction |
| Logistic Regression | Classification | Spam detection |
| Decision Tree | Both | Customer churn |
| Random Forest | Both | Fraud detection |
| K-Means | Clustering | Customer segments |
` },
    { moduleId: m4.id, title: "ML Prediction", contentType: "coding",
      codeTemplate: `from sklearn.linear_model import LinearRegression
import numpy as np

# Training data: hours studied vs score
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([50, 55, 65, 70, 80])

model = LinearRegression()
model.fit(X, y)

# Predict score for 6 hours
prediction = model.predict([[6]])
print(f'Predicted score for 6 hours: {prediction[0]:.1f}')`,
      orderIndex: 3, duration: "25 min" }
  ]});

  console.log('✅ Python for Data Science course created!');
  console.log('   Course ID: ' + c.id);
}

main().catch(console.error).finally(function() { prisma.$disconnect(); });