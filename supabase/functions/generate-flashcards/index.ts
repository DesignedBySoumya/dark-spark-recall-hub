
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('Starting flashcard generation...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const videoURL = formData.get('videoURL') as string;
    const subject = formData.get('subject') as string || 'General';

    console.log('Form data received:', { 
      hasFile: !!file, 
      videoURL, 
      subject 
    });

    let extractedContent = '';

    if (file) {
      console.log('Processing file:', file.name, file.type);
      
      if (file.type === 'application/pdf') {
        // For PDF files, we'll extract text content
        const fileBuffer = await file.arrayBuffer();
        const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
        
        console.log('Calling OpenAI for PDF processing...');
        
        // Use OpenAI to extract and understand PDF content
        const pdfResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at extracting educational content from documents. Extract the key concepts, definitions, and important information that would be useful for creating study flashcards.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Please extract the main educational content from this PDF document. Focus on key concepts, definitions, formulas, and important facts that would be good for flashcards.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:application/pdf;base64,${base64File}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 2000
          }),
        });

        if (!pdfResponse.ok) {
          throw new Error(`OpenAI API error: ${pdfResponse.statusText}`);
        }

        const pdfData = await pdfResponse.json();
        extractedContent = pdfData.choices[0].message.content;
        console.log('PDF content extracted successfully');
        
      } else if (file.type.startsWith('image/')) {
        // For images, use vision capabilities
        const fileBuffer = await file.arrayBuffer();
        const base64File = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
        
        console.log('Calling OpenAI for image processing...');
        
        const imageResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at extracting educational content from images. Extract text, concepts, diagrams, and any educational information visible in the image.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract all educational content from this image. Include any text, concepts, formulas, or diagrams that would be useful for creating study flashcards.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${file.type};base64,${base64File}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 1500
          }),
        });

        if (!imageResponse.ok) {
          throw new Error(`OpenAI API error: ${imageResponse.statusText}`);
        }

        const imageData = await imageResponse.json();
        extractedContent = imageData.choices[0].message.content;
        console.log('Image content extracted successfully');
        
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }
      
    } else if (videoURL) {
      // For video URLs, we'll extract the video ID and get transcript/summary
      console.log('Processing video URL:', videoURL);
      
      let videoId = '';
      if (videoURL.includes('youtube.com') || videoURL.includes('youtu.be')) {
        const urlParams = new URLSearchParams(new URL(videoURL).search);
        videoId = urlParams.get('v') || videoURL.split('/').pop()?.split('?')[0] || '';
      }
      
      // For now, we'll simulate content extraction from video
      extractedContent = `Educational content from video: ${videoURL}. This video covers important topics related to ${subject}. Key concepts include fundamental principles, practical applications, and essential knowledge for understanding the subject matter.`;
      console.log('Video content simulated');
    }

    if (!extractedContent) {
      throw new Error('Could not extract content from the provided source');
    }

    console.log('Generating flashcards from extracted content...');

    // Generate flashcards from extracted content
    const flashcardResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates effective flashcards. Generate 5-8 high-quality flashcards from the provided content. Each flashcard should have a clear question and a concise, accurate answer. Focus on key concepts, definitions, and important facts. Return the response as a JSON array with objects containing "question", "answer", "subject", and "difficulty" fields. Difficulty should be "easy", "medium", or "hard".'
          },
          {
            role: 'user',
            content: `Create flashcards from this content for the subject "${subject}":\n\n${extractedContent}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!flashcardResponse.ok) {
      throw new Error(`OpenAI API error: ${flashcardResponse.statusText}`);
    }

    const flashcardData = await flashcardResponse.json();
    let flashcards;

    try {
      // Try to parse as JSON first
      const content = flashcardData.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found');
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback method');
      // Fallback: create flashcards from the raw response
      flashcards = [
        {
          question: `What are the main concepts covered in this ${subject} content?`,
          answer: extractedContent.substring(0, 200) + '...',
          subject: subject,
          difficulty: 'medium'
        },
        {
          question: `What key information should be remembered from this ${subject} material?`,
          answer: 'The content covers fundamental principles and important concepts that are essential for understanding the subject.',
          subject: subject,
          difficulty: 'medium'
        }
      ];
    }

    // Ensure all flashcards have required fields
    const processedFlashcards = flashcards.map((card: any) => ({
      question: card.question || 'Generated question',
      answer: card.answer || 'Generated answer',
      subject: card.subject || subject,
      difficulty: card.difficulty || 'medium'
    }));

    console.log('Generated flashcards successfully:', processedFlashcards.length);

    return new Response(JSON.stringify({ 
      flashcards: processedFlashcards,
      extractedContent: extractedContent.substring(0, 500) + '...' 
    }), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });

  } catch (error) {
    console.error('Error in generate-flashcards function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate flashcards', 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  }
});
