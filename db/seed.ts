import { PrismaClient } from "@prisma/client";
import sampleData from "./sample-data";
import { hash } from "@/lib/encrypt";

type UserData = {
  name: string;
  email: string;
  password: string;
  role: string;
}[];

async function main() {
  const prisma = new PrismaClient();

  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.product.createMany({
    data: sampleData.products,
  });

  const users: UserData = [];

  sampleData.users.forEach(async (u) => {
    users.push({
      ...u,
      password: await hash(u.password),
    });
  });
  await prisma.user.createMany({
    data: users,
  });

  console.log("Database seeded successfully");
}

main();
