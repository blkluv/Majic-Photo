const { GoogleGenAI } = require('@google/genai');

// Initialize the Google GenAI client
let ai;
let isInitialized = false;

try {
  // Initialize with API key if available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    isInitialized = true;
    console.log('Nano Banana AI initialized successfully');
  } else {
    console.log('No Gemini API key configured');
  }
} catch (error) {
  console.error('Failed to initialize Google GenAI:', error.message);
}

async function classifyImage(imageBuffer) {
  if (!isInitialized) {
    console.log('AI not initialized, using default classification');
    return 'exterior';
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const prompt = [
      { text: 'Classify this real estate image into exactly one of these categories: "exterior" (outside photo of building), "empty_interior" (interior empty room with no furniture), "cluttered_interior" (interior with furniture/clutter). Respond with only the category name, nothing else.' },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ];

    // Use gemini-1.5-flash for classification
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    let classification = 'exterior'; // default
    
    // Extract text from response
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            classification = part.text.trim().toLowerCase().replace(/['"]/g, '');
            break;
          }
        }
      }
    }
    
    // Validate classification
    if (['exterior', 'empty_interior', 'cluttered_interior'].includes(classification)) {
      console.log(`Image classified as: ${classification}`);
      return classification;
    }
    
    console.log(`Invalid classification "${classification}", using default`);
    return 'exterior';
    
  } catch (error) {
    console.error('Classification error:', error.message);
    return 'exterior';
  }
}

async function enhanceImage(imageBuffer, classification, roomName = null, customPrompt = null) {
  console.log(`Processing ${classification} image with Nano Banana enhancement`, roomName ? `for ${roomName}` : '');
  
  if (!isInitialized) {
    console.log('AI not initialized, returning original image');
    return imageBuffer;
  }

  try {
    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Use custom prompt if provided, otherwise create enhancement prompt based on classification
    let enhancementPrompt;
    
    if (customPrompt) {
      enhancementPrompt = customPrompt;
      console.log('Using custom prompt for reprocessing');
    } else {
      // Add room type prefix if available
      const roomPrefix = roomName ? `This is a ${roomName.toLowerCase()}. ` : '';
      
      // Create enhancement prompt based on classification
      switch (classification) {
        case 'cluttered_interior':
          enhancementPrompt = roomPrefix + 'Create a picture of this cluttered room transformed into a professionally staged interior. Remove all clutter and mess while keeping existing furniture that fits well. CRITICAL RESTRICTIONS - DO NOT add, remove, or modify ANY permanent fixtures: no fireplaces, built-in shelving, built-in hutches, kitchen cabinets, bathroom vanities, ceiling lights, wall sconces, crown molding, or any fixtures attached to walls/ceilings. Keep ALL existing architectural elements and permanent installations exactly as they are. Only add or rearrange moveable staging furniture and decorative items that a staging company could realistically bring. Ensure any new furniture is properly scaled to match the room dimensions and ceiling height. Make it look clean, organized, and ready for a real estate showing.';
          break;
      case 'empty_interior':
        enhancementPrompt = roomPrefix + 'Create a picture of this empty room furnished as a professionally staged home. Add ONLY moveable staging furniture: sofas, chairs, coffee tables, dining tables, rugs, plants, artwork on easels, and decorative items that sit on floors or existing surfaces. CRITICAL RESTRICTIONS - DO NOT add, remove, or modify ANY permanent fixtures: no fireplaces, built-in shelving, built-in hutches, kitchen cabinets, bathroom vanities, ceiling lights, wall sconces, crown molding, or any fixtures attached to walls/ceilings. Keep ALL existing architectural elements and permanent installations exactly as they are. Only add furniture and decor that a staging company could realistically bring in and remove. Ensure all furniture is properly scaled to match the room size and proportions - furniture should look realistic and appropriately sized for the space. Use existing room lighting and add only portable table lamps or floor lamps if needed.';
        break;
      case 'exterior':
        enhancementPrompt = roomPrefix + 'Create a picture of this property exterior enhanced for real estate. Improve lighting to golden hour quality, enhance landscaping with appropriately scaled plants and features, remove any temporary objects like trash cans or vehicles. Keep all existing architectural features, windows, doors, and building elements exactly as they are. Ensure any landscaping additions are properly proportioned to the building size and maintain realistic scale - plants and features should match the building proportions.';
        break;
      default:
        enhancementPrompt = roomPrefix + 'Create an enhanced version of this real estate photo that looks professional and appealing to buyers. Keep all existing architectural elements, fixtures, and built-in features unchanged. Only improve lighting, colors, and add appropriately scaled decorative elements that enhance the space without structural modifications. Ensure proper proportions and realistic scaling.';
    }
    }

    // Prepare prompt with text and image
    const prompt = [
      { text: enhancementPrompt },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ];

    console.log('Calling Nano Banana API for image generation...');
    
    // Use the image generation model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview', // or 'gemini-2.0-flash-exp'
      contents: prompt
    });

    // Extract generated image from response
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            // Found the generated image
            const enhancedBuffer = Buffer.from(part.inlineData.data, 'base64');
            console.log('Enhanced image generated successfully');
            return enhancedBuffer;
          } else if (part.text) {
            console.log('Response text:', part.text.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('No generated image in response');
    
  } catch (error) {
    console.error('Nano Banana enhancement error:', error.message);
    
    // Check for quota/rate limit errors
    if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
      console.log('API quota exceeded. Image generation temporarily unavailable.');
      console.log('For production, consider upgrading to paid plan or implementing retry logic');
      
      // For now, return original image when quota exceeded
      // In production, you might want to:
      // 1. Queue the image for later processing
      // 2. Use alternative image generation service
      // 3. Implement exponential backoff retry
      return imageBuffer;
    }
    
    // Try fallback model if the preview model isn't available
    if (error.message.includes('model') || error.message.includes('not found')) {
      console.log('Primary model unavailable, trying fallback...');
      
      // Skip fallback to avoid additional quota usage when quota is the issue
      if (!error.message.includes('quota') && !error.message.includes('429')) {
        try {
          console.log('Attempting fallback with gemini-2.0-flash-exp...');
          const base64Image = imageBuffer.toString('base64');
          const prompt = [
            { text: `Generate an enhanced real estate photo based on this ${classification} image` },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ];
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: prompt
          });
          
          // Check for generated image
          if (response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const enhancedBuffer = Buffer.from(part.inlineData.data, 'base64');
                  console.log('Enhanced image generated with fallback model');
                  return enhancedBuffer;
                }
              }
            }
          }
        } catch (fallbackError) {
          console.error('Fallback model also failed:', fallbackError.message);
        }
      }
    }
    
    // Throw error if all attempts fail - don't return original as "enhanced"
    console.log('Enhancement failed - will not return original image as enhanced');
    throw new Error('Image enhancement failed - API unavailable or returned errors');
  }
}

module.exports = { classifyImage, enhanceImage };