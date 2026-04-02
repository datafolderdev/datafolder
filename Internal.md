## Internals of datafolder

The best mechanism to index and partition data is **by the nature of data**. Instead of forcing data to transform, it should seamlessly embrace and fully cater to the **uniqueness** of each and every data to accomplish nature-level efficiency, **mentally and mechanically**. Whatever data is, it follows like fluid.

This is the **design philosophy** behind datafolder, a lightning fluid schemaless JSON database, featuring an AI-friendly API for simple and human maintainable code generation, millisecond data response, with full index and trigger features supported, and the unique ability to browse and manage data as a folder tree directly in your browser. Data can be organized naturally into folders, sub folders and files. It works perfectly for a wide range of scenarios, from game/application backends to embedded systems to IoT to edge computing.

### User Level Data Layout

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

### In-memory Tree Structure

datafolder uses a tree structure to store the folder/file relationship in memory. Each node has a subdir map and a file map. subdir map stores subdir nodes, which in turn has its subdir map. file map stores the files that are inside this folder. JSON data is stored as file content within each file node. They are all normal Javascript Objects themselves. Thanks to V8 engine's highly optimized object [property](https://v8.dev/blog/fast-properties) [access](https://v8.dev/docs/hidden-classes), getting the dir/file node by path and getting properties from JSON data are extremely fast. These dir/file node and file content can be loaded beforehand, or loaded on demand. And will be released according to visiting time/count to reduce runtime memory usage.

### Lock Free, Always Sync, Immediate Programming Mode

When dealing with datafolder, you write your Node.js code in a lock free, always sync, immediate programming mode.

- The data are just normal Javascript objects and live within the same memory space of your code. No network traffic, no serialization/deserialization, no overhead. You code directly manipulates the data.
- No need to worry about whether data is modified by others during your changes. No need to guard data corruption with a transaction.
- You get the needed data, exam them, make your decisions and changes, and store them back. That is it.
- datafolder's underlying mechanism guarantees the correctness of running your code in this mode.
- start() and stop() are the only two APIs that need be called with await. All other APIs are called synchronously.

### Accumulated Change List

datafolder make changes immediately in memory. It calculates deltas of such changes and store these deltas in a log file called acl file. Since only storing deltas, these changes are compact. datafolder utilize Node.js's processes and offload the actual acl storing work to separate process. In fact, this change stream is also sent out to other processes to create snapshots, read-only replicas and to compress snapshots etc.
These deltas can be of the following types:

1. Adding a subdir or file to a dir.
2. Deleting a subdir or file from a dir.
3. Delete a dir or a file itself.
4. Merging JSON changes.

JSON changes are further separated into the following:

1. Deleting a property
2. Adding a property with value.
3. Changing a property to new value.

These deltas are appended to the acl log file in sequence. Once the log file reaches a certain size a new log file will be created and appended to. Storing these acl1, acl2, ...,acln files keep the change history of the whole database. The whole data can be reconstructed by re-applying these acl files in sequence.

### Snapshots

The whole data changes are stored as acl1, acl2, acl3,..., acln files. But the reconstruct process takes time to read and apply all these acl files. In order to reduce reconstruction time snapshots are introduced. They store the exact shapes and contents of the items changed after a certain acl file. For example,

```
acl1, snapshot1, acl2, snapshot2, acl3, snapshot3, acl4, acl5, snapshot5, ...
```

snapshot1 will store the whole data afte applying acl1. It will shadow acl1.

snapshot2 will store the whole changes that are introduced by applying acl2 and will shadow acl2. That is, if a dir/file is changed during acl2, it will be stored as whole in snapshot2 and will shadow the one in snapshot1. If a dir/file is not changed during acl2, it will remain intact in snapshot1.

The same as snapshot3, snapshot5 etc. They only contain changed items after the last snapshots. This way the whole data is constructed by various snapshots and the following acls. Since snapshots are holding the whole items, they don't need reconstruction but only need to be able to read a certain dir/file and content out.

### Snapshot Indexes

Each Snapshot is a big key value pair map. It is stored in two files: posMap file and valueList file.

- posMap file is storing the [start, length] of the content of each key in the valueList file.
- valueList file is storing the values of this snapshot.

For example,
posMap file contains

```
key1 [0, 28]
key2 [28, 128]
key3 ...
```

valueList file contains

```
content1 (from 0, length 28)
content2 (from 28, length 128)
content3 (...)
```

In this format, when posMap is loaded we can read arbitrary key content from valueList file. But if posMap is big, itself will be indexed using prefixPM file.
prefixPM file is storing the [start, length] of each prefix (like the first 2 characthers of keys) to the posMap file.

```
prefix1 [0, 38]
prefix2 [38, 120]
```

This way we only need to load prefixPM files in memory. Corresponding posmap content and valueList content can be loaded on-demand.

For example, we can store 20 years of [Hacker](https://news.ycombinator.com/item?id=46435308) [News](https://github.com/DOSAYGO-STUDIO/HackerBook) which is 22GB into datafolder in the layout of

```
hackernews/{year}/{month}/{day}/{id}
```

And each file contains the full story and the nested comments in a Javascript object. Even with 22GB contents, since they are partitioned naturally and each folder only contains a few thousands files they can be read via datafolder UI directly within the browser.

<img width="100%" alt="hackernews" src="https://github.com/user-attachments/assets/c7788426-9079-4628-b82f-c1bbff70f6ed" />

### Snapshot Shadowing and compactions

The same key with updated values will be stored in multiple snapshots and the latest one shadows all previous ones. At some point, thes redundant key/values will take up too much disc space. datafolder can automatically detect the threshold, and save the snapshots into new compacted ones with these redundances removed. These compactions are done in different processes and won't use the main process's time.
