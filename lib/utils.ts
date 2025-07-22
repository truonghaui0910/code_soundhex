import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate slug from text
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to ensure unique custom_url
export async function generateUniqueCustomUrl(supabase: any, tableName: string, baseSlug: string, excludeId?: number): Promise<string> {
    let customUrl = baseSlug;
    let counter = 1;
    
    while (true) {
        let query = supabase
            .from(tableName)
            .select("id")
            .eq("custom_url", customUrl);
            
        if (excludeId) {
            query = query.neq("id", excludeId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error(`Error checking custom_url uniqueness:`, error);
            throw new Error(`Failed to check custom_url uniqueness: ${error.message}`);
        }
        
        if (data.length === 0) {
            return customUrl;
        }
        
        customUrl = `${baseSlug}-${counter}`;
        counter++;
    }
}
