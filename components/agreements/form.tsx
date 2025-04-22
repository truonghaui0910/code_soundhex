"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Types for our form fields
interface RightOption {
  id: string;
  title: string;
  description: string;
  checked: boolean;
}

interface FormField {
  id: string;
  name: string;
  title: string;
  required: boolean;
  value: string;
}

// Types for API response
interface TemplateResponse {
  templateName: string;
  rightOptions: {
    id: string;
    title: string;
    description: string;
    type: string;
  }[];
  formFields: {
    id: string;
    name: string;
    title: string;
    required: boolean;
    type: string;
  }[];
}

export default function AgreementForm() {
  const router = useRouter();
  
  // State for the rights options (checkboxes)
  const [rightOptions, setRightOptions] = useState<RightOption[]>([]);
  // State for the text fields
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [templateName, setTemplateName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for notes
  const [notes, setNotes] = useState("");
  
  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch template data from our backend API
  useEffect(() => {
    const fetchTemplateData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Using the new path under /api/agreements/templates/3
        const response = await fetch("/api/agreements/templates/3");
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data: TemplateResponse = await response.json();
        console.log("Template data:", data);
        
        setTemplateName(data.templateName || "New Agreement");
        
        // Convert API response to RightOption format with checked=false
        const options: RightOption[] = data.rightOptions.map(option => ({
          ...option,
          checked: false
        }));
        
        setRightOptions(options);
        
        // Initialize form fields with empty values
        const fields: FormField[] = data.formFields.map(field => ({
          ...field,
          value: ""
        }));
        
        setFormFields(fields);
      } catch (err) {
        console.error("Error fetching template data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        
        // Fallback to default options if API fails
        setRightOptions([
          {
            id: "digital-distribution",
            title: "Digital Distribution",
            description: "Rights to distribute music across digital streaming platforms, online stores, and other digital channels.",
            checked: false
          },
          {
            id: "user-generated-content-monetization",
            title: "User Generated Content Monetization",
            description: "Rights to monetize when your music is used in user-generated content on platforms like YouTube, TikTok, etc.",
            checked: false
          },
          {
            id: "marketing-and-promotion",
            title: "Marketing and Promotion",
            description: "Rights to use your music in marketing campaigns, promotional materials and advertisements.",
            checked: false
          },
          {
            id: "licensing-services",
            title: "Licensing Services",
            description: "Rights to license your music for use in films, TV shows, commercials, and other media.",
            checked: false
          },
          {
            id: "magazine-blog-pr",
            title: "Magazine/Blog PR",
            description: "Rights to feature your music in magazines, blogs, and other press outlets.",
            checked: false
          }
        ]);
        
        setFormFields([
          {
            id: "client-name",
            name: "Client Name",
            title: "Client Name",
            required: true,
            value: ""
          }
        ]);
        
        setTemplateName("New Agreement (Default Template)");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplateData();
  }, []);
  
  // Handle checkbox change
  const handleCheckboxChange = (id: string) => {
    setRightOptions(rightOptions.map(option => 
      option.id === id ? { ...option, checked: !option.checked } : option
    ));
  };
  
  // Handle text field change
  const handleFieldChange = (id: string, value: string) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, value } : field
    ));
  };
  
  // Handle save
  const handleSave = async () => {
    // Validate at least one option is selected
    if (!rightOptions.some(option => option.checked)) {
      toast.error("Please select at least one right option");
      return;
    }
    
    // Validate required text fields
    const missingRequiredFields = formFields
      .filter(field => field.required && !field.value.trim())
      .map(field => field.title);
    
    if (missingRequiredFields.length > 0) {
      toast.error(`Please fill in the following required fields: ${missingRequiredFields.join(", ")}`);
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare the data to send to the API
      const agreementData = {
        selectedRights: rightOptions.map(option => ({
          id: option.id,
          checked: option.checked
        })),
        formFields: formFields.map(field => ({
          id: field.id,
          value: field.value
        }))
      };
      
      // Send the data to our backend API
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agreementData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Agreement saved:", result.data);
      
      // Show success message
      toast.success("Agreement saved successfully");
      
      // Navigate back to the agreements list
      router.push("/agreements");
    } catch (error) {
      console.error("Error saving agreement:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save agreement");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isLoading ? "Loading..." : `Create Agreement: ${templateName}`}
        </h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to List
        </Button>
      </div>
      
      {/* Form Fields Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agreement Information</CardTitle>
          <CardDescription>Enter the details for this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-rose-600"></div>
              </div>
            ) : (
              formFields.map((field) => (
                <div key={field.id} className="grid w-full items-center gap-1.5">
                  <Label htmlFor={field.id} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                    {field.title}
                  </Label>
                  <Input
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full"
                    placeholder={`Enter ${field.title.toLowerCase()}`}
                    required={field.required}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Rights Options Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Rights</CardTitle>
          <CardDescription>Select the rights to include in this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
              <p className="font-medium">Error loading agreement options</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-2">Using default options instead.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {rightOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={option.checked}
                    onCheckedChange={() => handleCheckboxChange(option.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor={option.id}
                      className="font-medium text-base cursor-pointer"
                    >
                      {option.title}
                    </Label>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Notes Section */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Add any additional notes or terms for this agreement</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter any additional notes or specific terms..."
            className="min-h-32"
          />
        </CardContent>
      </Card> */}
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save Agreement"}
        </Button>
      </div>
    </div>
  );
}