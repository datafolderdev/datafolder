# datafolder

datafolder is a lightning fluid JSON database for high speed SSDs, featuring an AI-friendly API for simple and human maintainable code generation, millisecond data response, with full index and trigger features supported, and the unique ability to browse and manage data as a folder tree directly in your browser. It works perfectly for a wide range of scenarios, from game/application backends to embedded systems to IoT to edge computing.

### Changelog

1.0.10 Added document [datafolder for high speed SSDs](https://github.com/datafolderdev/datafolder/wiki/datafolder-for-high-speed-SSDs)

1.0.9 Added Typescript type declarations.

1.0.7 Added trigger editor and [Internals of datafolder](https://github.com/datafolderdev/datafolder/wiki/Internals-of-datafolder)

1.0.6 Added code mirror as the query editor.

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

## Features

🤖 AI-Friendly, Simple API: Designed for easy code generation by AI and long-term maintainability by humans.

⚡ Extreme Data Access Speed: Supports fully in-memory operation for millisecond response, with configurable persistence to high-speed SSD.

🌐 Built-in Browser Management: Visually browse and manage your data as a folder hierarchy directly within the browser, no separate tools needed.

🧩 Plain JavaScript: Built with plain JavaScript, offers full TypeScript support and safe atomic writes.

🔧 Designed for application/game backends, IoT, and edge computing scenarios, easily deployable on servers, in browsers, and even on embedded hardware.

### 1. Simple CRUD APIs

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

### 2. Batch APIs

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

### 3. Powerful Query Support. Auto Create Needed Indexes

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

### 4. Flexible Trigger Support to Monitor Any Changes

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

## Example

Once you install datafolder via

```bash
npm insall datafolder
```

you can cd to node_modules/datafolder, then run

```bash
npm install
```

to install the dev dependency fastify. Then run

```bash
npm run airbnb
```

It will download the [AirBnB data](https://raw.githubusercontent.com/neelabalan/mongodb-sample-dataset/refs/heads/main/sample_airbnb/listingsAndReviews.json) (around 100MB) and insert into the following folder structure:

```
airbnb/{property_type}/{room_type}/{bed_type}/{_id}
```

Once the data is inserted, it will open the browser at [datafolderui](http://localhost:3628/datafolderui/index.html) and the whole folder structures can be navigated.

<img width="2560" height="1438" alt="datafolder UI" src="https://github.com/user-attachments/assets/cf07fb86-5634-438e-b28e-424335088a68" />

Next time to bring up the UI:

```bash
npm run ui
```

Complex query examples can be found in the scripts folder source code.
