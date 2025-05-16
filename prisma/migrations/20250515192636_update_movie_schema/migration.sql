/*
  Warnings:

  - You are about to drop the `_ActorToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CountryToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DirectorToMovie` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Actor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Director` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_ActorToMovie" DROP CONSTRAINT "_ActorToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_ActorToMovie" DROP CONSTRAINT "_ActorToMovie_B_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToMovie" DROP CONSTRAINT "_CategoryToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToMovie" DROP CONSTRAINT "_CategoryToMovie_B_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToMovie" DROP CONSTRAINT "_CountryToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToMovie" DROP CONSTRAINT "_CountryToMovie_B_fkey";

-- DropForeignKey
ALTER TABLE "_DirectorToMovie" DROP CONSTRAINT "_DirectorToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_DirectorToMovie" DROP CONSTRAINT "_DirectorToMovie_B_fkey";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "chieurap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "episodeCurrent" TEXT,
ADD COLUMN     "episodeTotal" TEXT,
ADD COLUMN     "imdbId" TEXT,
ADD COLUMN     "isCopyright" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify" TEXT,
ADD COLUMN     "showtimes" TEXT,
ADD COLUMN     "subDocquyen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tmdbId" TEXT,
ADD COLUMN     "tmdbType" TEXT,
ADD COLUMN     "tmdbVoteAverage" DOUBLE PRECISION,
ADD COLUMN     "tmdbVoteCount" INTEGER;

-- DropTable
DROP TABLE "_ActorToMovie";

-- DropTable
DROP TABLE "_CategoryToMovie";

-- DropTable
DROP TABLE "_CountryToMovie";

-- DropTable
DROP TABLE "_DirectorToMovie";

-- CreateTable
CREATE TABLE "MovieActor" (
    "movieId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,

    CONSTRAINT "MovieActor_pkey" PRIMARY KEY ("movieId","actorName")
);

-- CreateTable
CREATE TABLE "MovieDirector" (
    "movieId" TEXT NOT NULL,
    "directorName" TEXT NOT NULL,

    CONSTRAINT "MovieDirector_pkey" PRIMARY KEY ("movieId","directorName")
);

-- CreateTable
CREATE TABLE "MovieCategory" (
    "movieId" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,

    CONSTRAINT "MovieCategory_pkey" PRIMARY KEY ("movieId","categorySlug")
);

-- CreateTable
CREATE TABLE "MovieCountry" (
    "movieId" TEXT NOT NULL,
    "countrySlug" TEXT NOT NULL,

    CONSTRAINT "MovieCountry_pkey" PRIMARY KEY ("movieId","countrySlug")
);

-- CreateIndex
CREATE UNIQUE INDEX "Actor_name_key" ON "Actor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Director_name_key" ON "Director"("name");

-- AddForeignKey
ALTER TABLE "MovieActor" ADD CONSTRAINT "MovieActor_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieActor" ADD CONSTRAINT "MovieActor_actorName_fkey" FOREIGN KEY ("actorName") REFERENCES "Actor"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieDirector" ADD CONSTRAINT "MovieDirector_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieDirector" ADD CONSTRAINT "MovieDirector_directorName_fkey" FOREIGN KEY ("directorName") REFERENCES "Director"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCategory" ADD CONSTRAINT "MovieCategory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCategory" ADD CONSTRAINT "MovieCategory_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCountry" ADD CONSTRAINT "MovieCountry_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCountry" ADD CONSTRAINT "MovieCountry_countrySlug_fkey" FOREIGN KEY ("countrySlug") REFERENCES "Country"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
