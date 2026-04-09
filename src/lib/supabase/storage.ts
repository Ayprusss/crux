import { createClient } from "./client"

const BUCKET_NAME = "place_photos"

/**
 * Uploads a file to the place_photos Supabase storage bucket.
 * 
 * @param file The File object retrieved from an input element
 * @param userId The ID of the authenticated user to namespace the path
 * @returns The public URL of the uploaded image
 */
export async function uploadPlacePhoto(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  
  // Generate a unique file path: userId/timestamp_filename
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `${userId}/${Date.now()}_${sanitizedName}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, { cacheControl: "3600", upsert: false })

  if (error) {
    console.error("Storage upload error:", error.message)
    throw new Error(`Failed to upload photo: ${error.message}`)
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}
