---
name: datafolder-builder
description: >
  Use this skill when building applications on top of datafolder — a lightning fluid JSON database for high speed SSDs, featuring an AI-friendly API for simple and human maintainable code generation, millisecond data response, with full index and trigger features supported, and the unique ability to browse and manage data as a folder tree directly in your browser. Data can be organized naturally into folders, sub folders and files. It works perfectly for a wide range of scenarios, from game/application backends to embedded systems to IoT to edge computing. Covers installation, basic usages, CRUD, batch APIs, powerful query support which auto creates needed indexes, flexible trigger support to monitor any changes.
  Trigger when a user asks to build, query, or operate with datafolder, write application code against it, or understand how to structure data and queries.
---

# datafolder Builder Skill

## What Is datafolder?

The best mechanism to index and partition data is **by the nature of data**. Instead of forcing data to transform, it should seamlessly embrace and fully cater to the **uniqueness** of each and every data to accomplish nature-level efficiency, **mentally and mechanically**. Whatever data is, it follows like fluid.

This is the **design philosophy** behind datafolder, a lightning fluid schemaless JSON database, featuring an AI-friendly API for simple and human maintainable code generation, millisecond data response, with full index and trigger features supported, and the unique ability to browse and manage data as a folder tree directly in your browser. Data can be organized naturally into folders, sub folders and files. It works perfectly for a wide range of scenarios, from game/application backends to embedded systems to IoT to edge computing.

## Features

🤖 AI-Friendly, Simple API: Designed for easy code generation by AI and long-term maintainability by humans.

⚡ Extreme Data Access Speed: Supports fully in-memory operation for millisecond response, with configurable persistence to high-speed SSD.

🌐 Built-in Browser Management: Visually browse and manage your data as a folder hierarchy directly within the browser, no separate tools needed.

🧩 Plain JavaScript: Built with plain JavaScript, offers full TypeScript support and safe atomic writes.

🔧 Designed for application/game backends, IoT, and edge computing scenarios, easily deployable on servers, in browsers, and even on embedded hardware.

## User Level Data Layout

Data can be organized naturally into folders, sub folders and files. For example, Orders can be stored in

```
orders/{year}/{month}/{day}/{order_id}
```

Flights can be stored as

```
flights/{from}/{to}/{flight_id}
```

Airports can be stored as

```
airports/{country}/{state}/{airport_id}
```

AI training data can be stored as

```
AITraining/{year}/{month}/{day}/chat_id/prompt
                                       /answer
```

When you conceive the data model, you don't need to think about tables, schemas, indexes etc. All you need to know is the nature of the data and then go with the most comfortable one for your mental mind.

## Installation

```javascript
  npm install "datafolder"
```

## How to use

```javascript
import DataFolder from "datafolder";
const dataFolder = new DataFolder(); //Specify where to store the data. Default is ./data/sampleDataFolder
await dataFolder.start(); //start() and stop() are the only two async places. All other code doesn't need await.
dataFolder.insert("traindata/2026/1/20/chat_0001", {
  userid: "user_0001",
  email: "a@b.com",
  feedbackScore: 5,
  address: { city: "a", zipcode: 123 },
});
dataFolder.insert("traindata/2026/1/20/chat_0001/prompt", "What is async/await?");
dataFolder.insert("traindata/2026/1/20/chat_0001/answer", "async/await is ...");
const { email, password, address, feedbackScore } = dataFolder.view("traindata/2026/1/20/chat_0001");
address.zipcode = 678;
dataFolder.insert("traindata/2026/1/20/chat_0001", { feedbackScore: feedbackScore + 1, address });
await dataFolder.stop();
```

Or operate with dir/file objects:

```javascript
const file = dataFolder.file("traindata/2026/1/20/chat_0001");
const { feedbackScore, address } = file.view({ feedbackScore: 1, address: 1 });
dataFolder.insert(file, { feedbackScore: feedbackScore + 1, address: { city: "c", zipcode: 663 } });
```

### Simple CRUD APIs

#### Create

```javascript
dataFolder.createFile("path/to/file");
dataFolder.createDir("path/to/dir");
dataFolder.insert("path/to/file", { email, address: { city, zipcode } });
```

#### Read

```javascript
const dir = dataFolder.dir("path/to/dir");
const { subdirList, fileList, sortedSubdirList } = dir;
const file = dataFolder.file("path/to/file");
const { email, address } = dataFolder.view("path/to/file", { email: 1, addres: 1 });
```

#### Update

```javascript
dataFolder.insert("path/to/file", { email: newEmail, address: { zipcode: newZipcode } });
dataFolder.insert(file, { feedbackScore: feedbackScore + 1 });
```

#### Delete

```javascript
dataFolder.delDir("path/to/dir");
dataFolder.delFile("path/to/file");
dataFolder.delContent("path/to/file");
dataFolder.remove("path/to/file", { email: 1, address: { zipcode: 1 } });
dataFolder.remove(file, { email: 1, address: { zipcode: 1 } });
```

### Batch APIs

```javascript
const [dir, file, { email, feedbackScore }] = dataFolder.fetch
  .dir("path/to/dir")
  .file("path/to/file")
  .view("path/to/file")
  .run();
dataFolder.batch
  .insert("path/to/chat_details", { user: "user_0001", feedbackScore: 100 })
  .insert("path/to/prompt", "what is LLM?")
  .insert("path/to/answer", "LLM is AI...")
  .remove("path/to/file", { address: { city: 1 } })
  .run();
```

### Powerful Query Support. Auto Create Needed Indexes

```javascript
// get all the training data in year 2026 with feedbackScore between 60 and 85.
dataFolder.queryFiles("traindata/2026/**", { feedbackScore: (x) => x >= 60 && x <= 85 });

// get training data of user_001 from July to Oct in year 2025, 2026 with feedbackScore higher than 90.
dataFolder.queryFiles(["traindata", { $in: [2025, 2026] }, { $gt: 6, $lte: 10 }], {
  feedbackScore: { $gt: 90 },
  userId: "user_0001",
});

dataFolder.queryFiles("flights/**", { _from: "airports/LAX" });
dataFolder.queryFiles(["flights", "*", "jan", (x) => x >= 5 && x <= 7], {
  $or: [{ _from: "airports/BIS" }, { _to: "airports/BIS" }],
});
dataFolder.queryFiles(["flights", "*", "feb", { $or: [5, 6, 7] }], {
  $or: [{ _from: "airports/BIS" }, { _to: "airports/BIS" }],
});
dataFolder.queryFiles(["flights", "*", "mar", { $gte: 5, lte: 7 }], {
  $or: [{ _from: "airports/BIS" }, { _to: "airports/BIS" }],
});
dataFolder.queryFilesMulti([
  [["airbnb", "Loft", "Entire home/apt", "Real Bed"], { address: { street: "Porto, Porto, Portugal" } }],
  ["airbnb/Loft/**", { minimum_nights: (x) => x >= 60 }],
]);
```

### Flexible Trigger Support to Monitor Any Changes

```javascript
function onPromptScoreChanged({ promptId, feedbackScore }) {
  const { oldValue, newValue } = feedbackScore;
  // Logic to handle prompt feedback score change.
}
dataFolder.insertTrigger("promptScoreChanged", "traindata/{promptId}", "feedbackScore");
dataFolder.on("promptScoreChanged", onPromptScoreChanged);
dataFolder.insert("traindata/prompt_1", { feedbackScore: 80 });
dataFolder.insert("traindata/prompt_2", { feedbackScore: 63 });
dataFolder.insert("traindata/prompt_1", { feedbackScore: 32 });
```

Will trigger the following calls:

```javascript
onPromptScoreChanged({ promptId: "student1", feedbackScore: { oldValue: undefined, newValue: 80 } });
onPromptScoreChanged({ promptId: "student2", feedbackScore: { oldValue: undefined, newValue: 63 } });
onPromptScoreChanged({ promptId: "student1", feedbackScore: { oldValue: 80, newValue: 32 } });
```
