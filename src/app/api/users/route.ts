import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    return client.db('stageControl').collection('users');
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const nameSearch = searchParams.get('name') || '';
    const emailSearch = searchParams.get('email') || '';
    const sort = searchParams.get('sort') || 'fullName'; // Default sort field
    const direction = searchParams.get('direction') || 'asc'; // Default direction

    const query: any = {};
    if (nameSearch) query.fullName = { $regex: nameSearch, $options: 'i' };
    if (emailSearch) query.email = { $regex: emailSearch, $options: 'i' };

    const collection = await connectToDatabase();
    const users = await collection
      .find(query)
      .sort({ [sort]: direction === 'asc' ? 1 : -1 }) // Sort based on query params
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await collection.countDocuments(query);

    return NextResponse.json({ users, total });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.fullName || !body.email || !body.role) throw new Error('Full Name, Email, and Role are required');
    const collection = await connectToDatabase();
    const result = await collection.insertOne(body);
    return NextResponse.json({ id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body._id) throw new Error('ID is required');
    const { _id, ...updateData } = body; // Destructure _id and rest of the fields
    const collection = await connectToDatabase();
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) }, // Match by _id
      { $set: updateData } // Update only the other fields
    );
    if (result.matchedCount === 0) throw new Error('User not found');
    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) throw new Error('ID is required');
    const collection = await connectToDatabase();
    await collection.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}