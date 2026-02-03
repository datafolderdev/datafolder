# datafolder

datafolder is a lightweight JSON database, featuring an AI-friendly API for simple and human maintainable code generation, millisecond data response, with full index and trigger features supported, and the unique ability to browse and manage data as a folder tree directly in your browser. It works perfectly for a wide range of scenarios, from game/application backends to embedded systems to IoT to edge computing.

## Installation

```javascript
  npm install "datafolder"
```

## How to use

```javascript
const DataFolder = require("datafolder");
const dataFolder = new DataFolder(); //Specify where to store the data. Default is ./data/sampleDataFolder
await dataFolder.start();
dataFolder.insert("users/2026/user_0001", {
  userid: "user_0001",
  email: "a@b.com",
  score: 5,
  address: { city: "a", zipcode: 123 },
});
dataFolder.insert("users/2026/user_0002", {
  userid: "user_0002",
  email: "c@b.com",
  score: 3,
  address: { city: "b", zipcode: 321 },
});
const { email, password, address, score } = dataFolder.view("users/2026/user_0002");
address.zipcode = 678;
dataFolder.insert("users/2026/user_0002", { score: score + 1, address });
await dataFolder.stop();
```

Or operate with dir/file objects:

```javascript
const file = dataFolder.file("users/2026/user_0002");
const { score, address } = file.view({ score: 1, address: 1 });
dataFolder.insert(file, { score: score + 1, address: { city: "c", zipcode: 663 } });
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
dataFolder.insert(file, { score: score + 1 });
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
const [dir, file, { email, score }] = dataFolder.fetch
  .dir("path/to/dir")
  .file("path/to/file")
  .view("path/to/file")
  .run();
dataFolder.batch
  .insert("path/to/file", { email: "email1@a.b.com" })
  .insert("path/to/file", { email: "email2", score: 100 })
  .remove("path/to/file", { address: { city: 1 } })
  .run();
```

### 3. Powerful Query Support. Auto Create Needed Indexes

```javascript
dataFolder.queryFiles("flights/**", { _from: "airports/LAX" });
dataFolder.queryFiles(["flights", "*", 1, (x) => x >= 5 && x <= 7], {
  $or: [{ _from: "airports/BIS" }, { _to: "airports/BIS" }],
});
dataFolder.queryFilesMulti([
  [["airbnb", "Loft", "Entire home/apt", "Real Bed"], { address: { street: "Porto, Porto, Portugal" } }],
  ["airbnb/Loft/**", { minimum_nights: (x) => x >= 60 }],
]);
```

### 4. Flexible Trigger Support to Monitor Any Changes

```javascript
function onEmailChanged({ studentId, email }) {
  const { oldValue, newValue } = email;
  // Logic to handle email change.
}
dataFolder.insertTrigger("emailChanged", "students/{studentId}", "email");
dataFolder.on("emailChanged", onEmailChanged);
dataFolder.insert("students/student1", { email: "email1" });
dataFolder.insert("students/student2", { email: "email2" });
dataFolder.insert("students/student1", { email: "email1_changed" });
```

Will trigger the following calls:

```javascript
onEmailChanged({ studentId: "student1", email: { oldValue: undefined, newValue: "email1" } });
onEmailChanged({ studentId: "student2", email: { oldValue: undefined, newValue: "email2" } });
onEmailChanged({ studentId: "student1", email: { oldValue: "email1", newValue: "email1_changed" } });
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
