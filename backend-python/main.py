# ===== Fixed Python Backend (main.py) =====
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
import requests
import os
import json
import re
import time
import logging
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PDF Quiz Generator", version="1.0.0")

# ✅ Fixed CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],  # Node + Frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ✅ Fixed environment variable
HF_API_TOKEN = os.getenv("HF_API_TOKEN")  # Make sure this is set in your environment
if not HF_API_TOKEN:
    logger.warning("⚠️  HF_API_TOKEN not set - using fallback question generation")

# ✅ Better model choice
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"

def clean_text(text: str) -> str:
    """Clean and prepare text for better processing"""
    try:
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove page numbers and common PDF artifacts
        text = re.sub(r'Page \d+|\d+\s*$', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)  # Remove standalone numbers
        # Limit length to prevent overwhelming the LLM
        return text[:3000] if len(text) > 3000 else text
    except Exception as e:
        logger.error(f"Error cleaning text: {e}")
        return text[:1000]  # Return truncated version on error

def call_hf_llm(prompt: str, max_retries: int = 2) -> str:
    """Call Hugging Face LLM with proper error handling"""
    if not HF_API_TOKEN:
        raise Exception("HF_API_TOKEN not available")
    
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 800,
            "temperature": 0.3,  # Lower for more consistent JSON
            "do_sample": True,
            "return_full_text": False
        },
        "options": {
            "wait_for_model": True,
            "use_cache": False
        }
    }
    
    for attempt in range(max_retries):
        try:
            logger.info(f"🤖 Calling LLM (attempt {attempt + 1})")
            response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=45)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    if "generated_text" in result[0]:
                        return result[0]["generated_text"]
                return str(result)
            else:
                logger.error(f"LLM API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"LLM call error (attempt {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                raise Exception(f"Failed to call LLM: {str(e)}")
            time.sleep(2)
    
    raise Exception("LLM call failed after retries")

def extract_json_from_text(text: str) -> List[Dict]:
    """Extract JSON array from LLM response"""
    try:
        # Look for JSON array patterns
        json_patterns = [
            r'\[[\s\S]*?\]',  # Standard array
            r'```json\s*(\[[\s\S]*?\])\s*```',  # Code block
            r'```\s*(\[[\s\S]*?\])\s*```'  # Generic code block
        ]
        
        for pattern in json_patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            for match in matches:
                try:
                    # Clean up the match
                    clean_match = match.strip()
                    if clean_match.startswith('[') and clean_match.endswith(']'):
                        parsed = json.loads(clean_match)
                        if isinstance(parsed, list) and len(parsed) > 0:
                            logger.info(f"✅ Successfully parsed JSON with {len(parsed)} questions")
                            return parsed
                except json.JSONDecodeError:
                    continue
        
        # Try parsing the entire text
        try:
            parsed = json.loads(text.strip())
            if isinstance(parsed, list):
                return parsed
        except:
            pass
            
        logger.warning("❌ Could not extract valid JSON from LLM response")
        return []
        
    except Exception as e:
        logger.error(f"JSON extraction error: {e}")
        return []

def generate_fallback_questions(text: str, count: int = 5) -> List[Dict]:
    """Generate simple questions when LLM fails"""
    try:
        logger.info(f"🔄 Generating {count} fallback questions")
        sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 30]
        questions = []
        
        for i, sentence in enumerate(sentences[:count]):
            words = sentence.split()
            if len(words) > 8:  # Ensure sentence is substantial
                # Find a good word to remove (not articles, prepositions, etc.)
                skip_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
                key_words = [w for w in words if w.lower() not in skip_words and len(w) > 3]
                
                if key_words:
                    key_word = key_words[len(key_words)//2]  # Pick middle word
                    question_text = sentence.replace(key_word, "______", 1)
                    
                    questions.append({
                        "question": f"Fill in the blank: {question_text}",
                        "options": [
                            {"text": key_word, "isCorrect": True},
                            {"text": f"not_{key_word}", "isCorrect": False},
                            {"text": f"alt_{key_word}", "isCorrect": False},
                            {"text": f"other_{key_word}", "isCorrect": False}
                        ],
                        "explanation": f"The correct answer is '{key_word}' based on the context.",
                        "type": "fallback"
                    })
        
        logger.info(f"✅ Generated {len(questions)} fallback questions")
        return questions
        
    except Exception as e:
        logger.error(f"Fallback generation error: {e}")
        return []

# ✅ Fixed endpoint with proper error handling and logging
@app.post("/extract")
async def extract_pdf(
    file: UploadFile = File(...),
    params: Optional[str] = Form(None)
):
    start_time = time.time()
    
    logger.info(f"📄 Processing file: {file.filename}")
    logger.info(f"📝 Content type: {file.content_type}")
    logger.info(f"📊 Params: {params}")
    
    try:
        # ✅ Enhanced file validation
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
            
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
            
        if file.content_type and file.content_type != "application/pdf":
            logger.warning(f"⚠️  Unexpected content type: {file.content_type}")

        # Parse parameters with error handling
        try:
            quiz_params = json.loads(params) if params else {}
        except json.JSONDecodeError:
            logger.warning("Invalid params JSON, using defaults")
            quiz_params = {}
            
        question_count = quiz_params.get('question_count', 10)
        difficulty = quiz_params.get('difficulty', 'medium')
        subject = quiz_params.get('subject', 'general')

        logger.info(f"🎯 Target: {question_count} questions, {difficulty} difficulty, {subject} subject")

        # ✅ Enhanced PDF extraction with better error handling
        text = ""
        try:
            # Read file content
            file_content = await file.read()
            logger.info(f"📖 File size: {len(file_content)} bytes")
            
            # Reset file pointer
            await file.seek(0)
            
            # Extract text using pdfplumber
            with pdfplumber.open(file.file) as pdf:
                total_pages = len(pdf.pages)
                logger.info(f"📚 Processing {total_pages} pages")
                
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text += f"\n--- Page {page_num + 1} ---\n{page_text}"
                    except Exception as e:
                        logger.warning(f"⚠️  Could not extract text from page {page_num + 1}: {e}")
                        continue

        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise HTTPException(status_code=400, detail=f"Could not process PDF: {str(e)}")

        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF appears to be empty or contains no extractable text")

        # Clean and prepare text
        cleaned_text = clean_text(text)
        logger.info(f"📝 Extracted text length: {len(cleaned_text)} characters")

        # Try LLM generation first, fall back if needed
        quiz_questions = []
        used_fallback = False
        
        if HF_API_TOKEN:
            # Enhanced prompt for better results
            prompt = f"""Create {question_count} multiple choice questions from this educational content about {subject}.

Return ONLY a JSON array in this exact format:
[
  {{
    "question": "What is the main concept discussed?",
    "options": [
      {{"text": "Correct answer", "isCorrect": true}},
      {{"text": "Wrong answer 1", "isCorrect": false}},
      {{"text": "Wrong answer 2", "isCorrect": false}},
      {{"text": "Wrong answer 3", "isCorrect": false}}
    ],
    "explanation": "Brief explanation"
  }}
]

Requirements:
- Exactly {question_count} questions
- {difficulty} difficulty level
- 4 options per question, only 1 correct
- Test understanding, not memorization
- Clear, specific questions

Content: {cleaned_text}"""

            try:
                llm_response = call_hf_llm(prompt)
                quiz_questions = extract_json_from_text(llm_response)
                
                if not quiz_questions or len(quiz_questions) == 0:
                    logger.warning("🔄 LLM returned no questions, using fallback")
                    used_fallback = True
                    quiz_questions = generate_fallback_questions(cleaned_text, question_count)
                    
            except Exception as llm_error:
                logger.error(f"🤖 LLM generation failed: {llm_error}")
                used_fallback = True
                quiz_questions = generate_fallback_questions(cleaned_text, question_count)
        else:
            logger.info("🔄 No LLM token, using fallback generation")
            used_fallback = True
            quiz_questions = generate_fallback_questions(cleaned_text, question_count)
        
        # Ensure we have questions
        if not quiz_questions:
            raise HTTPException(status_code=500, detail="Failed to generate any questions")
        
        # Adjust question count
        if len(quiz_questions) > question_count:
            quiz_questions = quiz_questions[:question_count]
        elif len(quiz_questions) < question_count and not used_fallback:
            # Try to generate more with fallback
            additional = generate_fallback_questions(cleaned_text, question_count - len(quiz_questions))
            quiz_questions.extend(additional)

        processing_time = round(time.time() - start_time, 2)

        result = {
            "success": True,
            "quiz": quiz_questions,
            "processingTime": processing_time,
            "metadata": {
                "textLength": len(text),
                "cleanedLength": len(cleaned_text),
                "questionsGenerated": len(quiz_questions),
                "difficulty": difficulty,
                "subject": subject,
                "fallbackUsed": used_fallback,
                "pages": total_pages if 'total_pages' in locals() else 0
            }
        }
        
        logger.info(f"✅ Successfully generated {len(quiz_questions)} questions in {processing_time}s")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Health check
@app.get("/")
async def root():
    return {"message": "PDF Quiz Generator is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "PDF Quiz Generator",
        "has_hf_token": bool(HF_API_TOKEN)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")