## datafolder, a lightning fluid JSON database to smooth SSD bumps and keep the high speed

### Solid-State Drives (SSDs)

[SSDs](https://www.kingston.com/en/blog/pc-performance/nand-flash-technology-and-ssd) are non-volatile, high-speed solid-state drives that store data on flash memory chips without requiring power, making them ideal for computers and mobile devices. Using NAND logic gates, they provide faster read/write speeds, better durability, and lower power consumption than traditional mechanical hard drives.

But they have physical constraints:

- NAND flash **cannot overwrite** data;
- it must **erase a whole block** before writing new data.

**High** Speed. But with **bumps**.

### Flash Translation Layer (FTL)

The Flash Translation Layer (FTL) is critical firmware running on an SSD controller that maps logical block addresses (LBAs) from the operating system to physical NAND flash locations. The FTL manages the "write amplification" issue by handling random write operations efficiently, typically using a mapping table cached in DRAM to maintain high speed. It enables SSDs to act like hard drives, managing data mapping, wear leveling, garbage collection, and bad block management to ensure performance and durability.

Key Functions of the FTL:

- Address Mapping: Translates Logical Block Addresses (LBAs) used by the OS to Physical Block Addresses (PBAs) on the NAND flash.
- Wear Leveling: Distributes write/erase cycles evenly across flash cells to prevent premature failure of specific sectors.
- Garbage Collection: Cleans up invalid data (data marked for deletion) and consolidates valid data into new blocks, freeing up space.
- Bad Block Management: Identifies and blocks memory locations that can no longer hold data reliably.

### Log-structured merge-trees (LSM trees)

Log-structured merge-trees (LSM trees) are write-optimized data structures designed for high-throughput, insert-heavy workloads by batching updates in memory and writing them sequentially to disk. They reduce random writes—ideal for SSDs—by avoiding in-place updates, using an in-memory memtable, and periodically merging immutable Sorted String Tables (SSTables).

Key Characteristics and Benefits of LSM trees to run on SSDs

- Sequential IO: LSM trees convert random write operations into sequential writes, which are much faster and more efficient on SSDs compared to traditional B-tree in-place updates, reducing SSD endurance issues.
- Write-Optimized Structure: By using a "log-structured" approach, incoming data is buffered in a memtable in memory and, when full, flushed as an ordered, immutable file (SSTable) to the SSD, minimizing write amplification.
- Compaction: To manage storage and improve read performance, files are periodically merged in the background, consolidating data and removing old versions, often referred to as compaction.

### datafolder, a lightning fluid JSON database, is a natural fit for high speed SSDs

datafolder is [based on LSM trees](https://github.com/datafolderdev/datafolder/wiki/Internals-of-datafolder), but taken to a higher level.

- Complex JSON data in a single virtual file for a record

The data is just a normal JSON [object](https://github.com/datafolderdev/datafolder/wiki/Internals-of-datafolder#in-memory-tree-structure). It can be as complex as keeping a customer's whole airbnb listings and comments. Such a big record greatly reduceds read/write amplifications.

- Changes are stored as deltas in append-only mode.

When changes are made to each virtual file, only [the deltas](https://github.com/datafolderdev/datafolder/wiki/Internals-of-datafolder#accumulated-change-list) are stored. And the delta changes from different virtual files/folders are merged and appended to ACL log files.

- Never overwrite. Always append or create new file.

datafolder never overwrites. It always appends to an ACL file, or create new [snapshot files](https://github.com/datafolderdev/datafolder/wiki/Internals-of-datafolder#snapshot-indexes). Each snapshot is stored in a prefix Position Mapping file, a Position Mapping file, and a Value List file.

- Multi-level Indexing makes it lightning fast.

	- Memory level folder tree indexing
    	- datafolder uses a tree structure to store the folder/file relationship in memory. Each node has a subdir map and a file map. subdir map stores subdir nodes, which in turn has its subdir map. file map stores the files that are inside this folder. JSON data is stored as file content within each file node. Thanks to V8 engine's highly optimized object [property](https://v8.dev/blog/fast-properties) [access](https://v8.dev/docs/hidden-classes), getting the dir/file node by path and getting properties from JSON data are extremely fast.
	- memory level JSON property indexing
    	- For example, we can create "emailAddress" property indexing on "users" folder, and use this index to query for users with a given email address. Arbitrary properties and comparison combinations are supported, like "address.city" + "department" etc.
	- Snapshot Position Mapping maps a key to its position in the corresponding valueList file.
	- Snapshot Prefix Position Mapping maps a key prefix to its range position in the corresponding Positing Mapping file.

### Future: Make datafolder runs directly on SSDs without the FTL, or Zoned Namespaces(ZNS) SSDs (formerly Open-Channel SSDs)
