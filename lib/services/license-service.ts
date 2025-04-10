type Submitter = {
    id: number;
    slug: string;
    uuid: string;
    name: string | null;
    email: string;
    phone: string | null;
    completed_at: string | null;
    declined_at: string | null;
    status: string;
    role: string;
  };
  
  type Template = {
    id: number;
    name: string;
    external_id: string | null;
  };
  
  type User = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  
  export type License = {
    id: number;
    slug: string;
    source: string;
    submitters_order: string;
    expire_at: string | null;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
    audit_log_url: string | null;
    combined_document_url: string | null;
    submitters: Submitter[];
    template: Template;
    created_by_user: User;
    status: string;
    completed_at: string | null;
  };
  
  export type LicenseResponse = {
    data: License[];
  };
  
  /**
   * Fetch licenses for a specific user email
   * @param email User email to fetch licenses for
   * @param templateId Template ID to filter licenses (default: 2)
   * @returns Array of licenses
   */
  export async function fetchLicenses(email: string, templateId: number = 2): Promise<License[]> {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      
      // Gọi API route của Next.js thay vì gọi trực tiếp API bên ngoài
      // Điều này giúp bảo vệ token xác thực ở phía server
      const url = new URL("/api/license", window.location.origin);
      url.searchParams.append("email", email);
      url.searchParams.append("templateId", templateId.toString());
      
      const response = await fetch(url.toString());
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
  
      const result: LicenseResponse = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching licenses:", error);
      throw error;
    }
  }