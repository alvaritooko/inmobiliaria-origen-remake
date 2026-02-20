import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY



export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: get public URL for a file in storage
export const getPublicUrl = (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

// Helper: convert image to WebP before upload
export const convertToWebP = (file, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            const maxWidth = 1920
            const scale = Math.min(1, maxWidth / img.width)
            canvas.width = img.width * scale
            canvas.height = img.height * scale

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            canvas.toBlob(resolve, 'image/webp', quality)
        }

        img.src = URL.createObjectURL(file)
    })
}

// Helper: upload image as WebP to property-images bucket
export const uploadPropertyImage = async (file, agentId, propertyId) => {
    const webpBlob = await convertToWebP(file)
    const fileName = `${agentId}/${propertyId}/${Date.now()}.webp`

    const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, webpBlob, {
            contentType: 'image/webp',
            upsert: false
        })

    if (error) throw error

    return getPublicUrl('property-images', fileName)
}
