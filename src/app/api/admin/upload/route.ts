import { NextRequest, NextResponse } from 'next/server'
import { Client, Storage, ID } from 'node-appwrite'

function createStorageClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY
  const bucketId = process.env.APPWRITE_BANNER_BUCKET_ID

  if (!endpoint || !projectId || !apiKey || !bucketId) {
    throw new Error('Missing APPWRITE_BANNER_BUCKET_ID environment variable')
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  return { storage: new Storage(client), bucketId, endpoint, projectId }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 })
    }

    const { storage, bucketId, endpoint, projectId } = createStorageClient()

    const bytes = await file.arrayBuffer()
    const nodeFile = new File([bytes], file.name, { type: file.type })

    const uploaded = await storage.createFile(bucketId, ID.unique(), nodeFile)

    const url = `${endpoint}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${projectId}`
    return NextResponse.json({ url, fileId: uploaded.$id })
  } catch (err) {
    console.error('POST /api/admin/upload:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
