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

  for (let i = 0; i < sampleData.users.length; i++) {
    const password = await hash(sampleData.users[i].password);
    users.push({
      ...sampleData.users[i],
      password,
    });
  }

  await prisma.user.createMany({
    data: users,
  });

  console.log("Database seeded successfully");
}

main();
