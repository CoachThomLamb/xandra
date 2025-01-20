-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FoodEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodItem" TEXT NOT NULL,
    "servingSize" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "calories" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
