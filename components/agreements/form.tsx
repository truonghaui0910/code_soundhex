
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
import { FileText, Plus, ArrowLeft, Save, CheckCircle, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-10 w-10 text-purple-300" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {isLoading ? "Loading..." : `Create Agreement`}
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              {isLoading ? "Preparing agreement template..." : `Template: ${templateName}`}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline"
                onClick={() => router.back()}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid gap-8">
          {/* Form Fields Section */}
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Agreement Information
              </CardTitle>
              <CardDescription>Enter the details for this agreement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  formFields.map((field) => (
                    <div key={field.id} className="grid w-full items-center gap-3">
                      <Label 
                        htmlFor={field.id} 
                        className={`text-base font-medium ${field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}`}
                      >
                        {field.title}
                      </Label>
                      <Input
                        id={field.id}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full h-12 text-base"
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
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Available Rights
              </CardTitle>
              <CardDescription>Select the rights to include in this agreement</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
                  <p className="font-medium">Error loading agreement options</p>
                  <p className="text-sm mt-2">{error}</p>
                  <p className="text-sm mt-2">Using default options instead.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {rightOptions.map((option) => (
                    <div 
                      key={option.id} 
                      className={`flex items-start space-x-6 border-2 p-8 rounded-xl transition-all duration-300 group cursor-pointer ${
                        option.checked 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                      onClick={() => handleCheckboxChange(option.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <Checkbox
                          id={option.id}
                          checked={option.checked}
                          onCheckedChange={() => handleCheckboxChange(option.id)}
                          className={`h-6 w-6 ${
                            option.checked 
                              ? 'data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600' 
                              : 'border-gray-400 dark:border-gray-500'
                          }`}
                        />
                      </div>
                      <div className="space-y-3 flex-1">
                        <Label
                          htmlFor={option.id}
                          className={`font-semibold text-xl cursor-pointer transition-colors block ${
                            option.checked 
                              ? 'text-purple-700 dark:text-purple-300' 
                              : 'text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                          }`}
                        >
                          {option.title}
                        </Label>
                        <p className={`leading-relaxed text-base ${
                          option.checked 
                            ? 'text-purple-600 dark:text-purple-200' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {option.checked && (
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              size="lg"
              className="px-8"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isLoading}
              size="lg"
              className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Agreement
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
