import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clean existing data
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Create stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Downtown Electronics',
      address: '123 Main St, New York, NY 10001',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Westside Fashion',
      address: '456 West Ave, Los Angeles, CA 90001',
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Tech Hub Central',
      address: '789 Tech Blvd, San Francisco, CA 94102',
    },
  });

  // Create products for store 1 (Downtown Electronics)
  await prisma.product.createMany({
    data: [
      {
        name: 'Laptop Pro 15',
        category: 'Electronics',
        price: 1299.99,
        quantity: 25,
        storeId: store1.id,
      },
      {
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 29.99,
        quantity: 150,
        storeId: store1.id,
      },
      {
        name: 'USB-C Cable',
        category: 'Accessories',
        price: 12.99,
        quantity: 200,
        storeId: store1.id,
      },
      {
        name: '4K Monitor',
        category: 'Electronics',
        price: 599.99,
        quantity: 15,
        storeId: store1.id,
      },
      {
        name: 'Mechanical Keyboard',
        category: 'Electronics',
        price: 149.99,
        quantity: 50,
        storeId: store1.id,
      },
      {
        name: 'Webcam HD',
        category: 'Electronics',
        price: 89.99,
        quantity: 8,
        storeId: store1.id,
      },
      {
        name: 'Phone Stand',
        category: 'Accessories',
        price: 19.99,
        quantity: 3,
        storeId: store1.id,
      },
    ],
  });

  // Create products for store 2 (Westside Fashion)
  await prisma.product.createMany({
    data: [
      {
        name: 'Cotton T-Shirt',
        category: 'Clothing',
        price: 24.99,
        quantity: 120,
        storeId: store2.id,
      },
      {
        name: 'Denim Jeans',
        category: 'Clothing',
        price: 79.99,
        quantity: 85,
        storeId: store2.id,
      },
      {
        name: 'Summer Dress',
        category: 'Clothing',
        price: 59.99,
        quantity: 45,
        storeId: store2.id,
      },
      {
        name: 'Leather Belt',
        category: 'Accessories',
        price: 34.99,
        quantity: 60,
        storeId: store2.id,
      },
      {
        name: 'Running Shoes',
        category: 'Footwear',
        price: 89.99,
        quantity: 40,
        storeId: store2.id,
      },
      {
        name: 'Winter Jacket',
        category: 'Clothing',
        price: 149.99,
        quantity: 5,
        storeId: store2.id,
      },
      {
        name: 'Baseball Cap',
        category: 'Accessories',
        price: 19.99,
        quantity: 2,
        storeId: store2.id,
      },
    ],
  });

  // Create products for store 3 (Tech Hub Central)
  await prisma.product.createMany({
    data: [
      {
        name: 'Smartphone X',
        category: 'Electronics',
        price: 899.99,
        quantity: 30,
        storeId: store3.id,
      },
      {
        name: 'Tablet Pro',
        category: 'Electronics',
        price: 649.99,
        quantity: 20,
        storeId: store3.id,
      },
      {
        name: 'Wireless Earbuds',
        category: 'Electronics',
        price: 159.99,
        quantity: 75,
        storeId: store3.id,
      },
      {
        name: 'Smart Watch',
        category: 'Electronics',
        price: 399.99,
        quantity: 12,
        storeId: store3.id,
      },
      {
        name: 'Portable Charger',
        category: 'Accessories',
        price: 39.99,
        quantity: 100,
        storeId: store3.id,
      },
      {
        name: 'Bluetooth Speaker',
        category: 'Electronics',
        price: 79.99,
        quantity: 6,
        storeId: store3.id,
      },
      {
        name: 'Screen Protector',
        category: 'Accessories',
        price: 9.99,
        quantity: 250,
        storeId: store3.id,
      },
      {
        name: 'Phone Case',
        category: 'Accessories',
        price: 24.99,
        quantity: 4,
        storeId: store3.id,
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

