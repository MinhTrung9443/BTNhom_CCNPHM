/**
 * MongoDB Shell Script - Drop unique index on uservouchers collection
 * 
 * Cách 1: Chạy từ MongoDB Compass hoặc MongoDB Shell
 * Cách 2: Copy paste code này vào MongoDB Compass Shell tab
 */

// Switch to your database
use("cnpm");

print("\n=== Dropping Unique Index on UserVouchers Collection ===\n");

// Get current indexes
print("Current indexes:");
const currentIndexes = db.uservouchers.getIndexes();
currentIndexes.forEach((index) => {
  print(`  - ${index.name}: ${JSON.stringify(index.key)}${index.unique ? " (UNIQUE)" : ""}`);
});

// Check if unique index exists
const hasUniqueIndex = currentIndexes.some(
  (idx) => idx.name === "userId_1_voucherId_1" && idx.unique === true
);

if (hasUniqueIndex) {
  print("\n✓ Found unique index: userId_1_voucherId_1");
  print("Dropping index...");
  
  try {
    db.uservouchers.dropIndex("userId_1_voucherId_1");
    print("✓ Unique index dropped successfully!");
    
    // Create non-unique index
    print("\nCreating non-unique compound index...");
    db.uservouchers.createIndex({ userId: 1, voucherId: 1 });
    print("✓ Non-unique index created successfully!");
  } catch (error) {
    print("✗ Error:", error.message);
  }
} else {
  print("\n✓ Unique index not found or already dropped.");
}

// Show final indexes
print("\nFinal indexes:");
const finalIndexes = db.uservouchers.getIndexes();
finalIndexes.forEach((index) => {
  print(`  - ${index.name}: ${JSON.stringify(index.key)}${index.unique ? " (UNIQUE)" : ""}`);
});

print("\n=== Migration Complete ===\n");
