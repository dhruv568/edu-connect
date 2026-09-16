import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface EducatorPhotoUpdate {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

const UPDATES: EducatorPhotoUpdate[] = [
  {
    firstName: "Vikramaditya",
    lastName: "Sen",
    avatarUrl: "/images/educators/male-1.png",
  },
  {
    firstName: "Rajeshwar",
    lastName: "Kulkarni",
    avatarUrl: "/images/educators/male-2.png",
  },
  {
    firstName: "Anand",
    lastName: "Vardhan",
    avatarUrl: "/images/educators/male-3.png",
  },
  {
    firstName: "Kavita",
    lastName: "Deshmukh",
    avatarUrl: "/images/educators/female-1.png",
  },
  {
    firstName: "Harish",
    lastName: "Parthasarathy",
    avatarUrl: "/images/educators/male-4.png",
  },
  {
    firstName: "Shalini",
    lastName: "Bannerjee",
    avatarUrl: "/images/educators/female-2.png",
  },
  {
    firstName: "Manoj",
    lastName: "Tiwari",
    avatarUrl: "/images/educators/male-5.png",
  },
  {
    firstName: "Arundhati",
    lastName: "Mukherjee",
    avatarUrl: "/images/educators/female-3.png",
  },
  {
    firstName: "Nandini",
    lastName: "Kulkarni",
    avatarUrl: "/images/educators/female-4.png",
  },
];

async function main() {
  console.log("Updating educator profile photos in database...");

  for (const update of UPDATES) {
    const profiles = await prisma.profile.findMany({
      where: {
        firstName: { contains: update.firstName },
        lastName: { contains: update.lastName },
      },
      include: { user: true },
    });

    if (profiles.length === 0) {
      console.warn(`No profile found matching ${update.firstName} ${update.lastName}`);
    } else {
      for (const p of profiles) {
        await prisma.profile.update({
          where: { id: p.id },
          data: { avatarUrl: update.avatarUrl },
        });
        console.log(
          `Updated photo for ${p.firstName} ${p.lastName} (${p.user?.email || p.userId}) -> ${update.avatarUrl}`
        );
      }
    }
  }

  console.log("Educator profile photos updated successfully in database!");
}

main()
  .catch((e) => {
    console.error("Error updating photos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
