import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createUser(id, firstName, lastName) {
  try {
    const newUser = await prisma.user.create({
      data: {
        id,
        firstName,
        lastName,
      },
    });
    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const [id, firstName, lastName] = process.argv.slice(2);

if (!id || !firstName || !lastName) {
  console.error('Please provide id, firstName, and lastName as arguments');
  process.exit(1);
}

createUser(id, firstName, lastName);
