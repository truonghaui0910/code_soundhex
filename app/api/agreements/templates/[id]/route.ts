// // app/api/agreements/templates/[id]/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // const id = params.id;
    
//     // Make the request to the external API
//     const response = await fetch(`http://178.156.150.2:8083/items/templates/3`, {
//       headers: {
//         "Authorization": "Bearer Fm70LiZ8WQ_1ExEVCqOxyoEgkwjiQiXs"
//       },
//       cache: 'no-store' // Don't cache the response
//     });
    
//     if (!response.ok) {
//       return NextResponse.json(
//         { error: `External API error: ${response.status}` },
//         { status: response.status }
//       );
//     }
    
//     // Get the data from the response
//     const data = await response.json();
    
//     // Process the data if needed
//     try {
//       // Parse fields from JSON string
//       const fields = JSON.parse(data.data.fields);
      
//       // Filter for checkbox fields (rights options)
//       const checkboxFields = fields.filter((field: any) => 
//         field.type === "checkbox" && 
//         // Filter out duplicates (fields with the same uuid that appear multiple times)
//         fields.findIndex((f: any) => f.uuid === field.uuid) === fields.indexOf(field)
//       );
      
//       // Map to simplified format
//       const rightOptions = checkboxFields.map((field: any) => ({
//         id: field.uuid,
//         title: field.title || field.name,
//         description: field.description || "",
//         type: "checkbox"
//       }));
      
//       // Filter for text fields (additional form fields)
//       const textFields = fields.filter((field: any) => 
//         field.type === "text" && 
//         // Filter out duplicates
//         fields.findIndex((f: any) => f.uuid === field.uuid) === fields.indexOf(field)
//       );
      
//       // Map text fields to a suitable format
//       const formFields = textFields.map((field: any) => ({
//         id: field.uuid,
//         name: field.name,
//         title: field.title || field.name,
//         required: field.required || false,
//         type: "text"
//       }));
      
//       // Return processed data with both field types
//       return NextResponse.json({ 
//         templateName: data.data.name,
//         rightOptions: rightOptions,
//         formFields: formFields
//       });
//     } catch (err) {
//       console.error("Error processing template data:", err);
      
//       // If there's an error parsing, return the original data
//       return NextResponse.json(data);
//     }
    
//   } catch (err) {
//     console.error("Error fetching template data:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch template data" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const response = await fetch(`http://178.156.150.2:8083/items/templates/${id}`, {
      headers: {
        "Authorization": `Bearer ${process.env.TEMPLATES_API_BEARER_TOKEN!}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    try {
      const fields = JSON.parse(data.data.fields);

      const checkboxFields = fields.filter((field: any) =>
        field.type === "checkbox" &&
        fields.findIndex((f: any) => f.uuid === field.uuid) === fields.indexOf(field)
      );

      const rightOptions = checkboxFields.map((field: any) => ({
        id: field.uuid,
        title: field.title || field.name,
        description: field.description || "",
        type: "checkbox"
      }));

      const textFields = fields.filter((field: any) =>
        field.type === "text" && (field.readonly === undefined || field.readonly === "false" || field.readonly === false) &&
        fields.findIndex((f: any) => f.uuid === field.uuid) === fields.indexOf(field)
      );

      const formFields = textFields.map((field: any) => ({
        id: field.uuid,
        name: field.name,
        title: field.title || field.name,
        required: field.required || false,
        type: "text"
      }));

      return NextResponse.json({
        templateName: data.data.name,
        rightOptions,
        formFields
      });

    } catch (err) {
      console.error("Error processing template data:", err);
      return NextResponse.json(data);
    }

  } catch (err) {
    console.error("Error fetching template data:", err);
    return NextResponse.json(
      { error: "Failed to fetch template data" },
      { status: 500 }
    );
  }
}