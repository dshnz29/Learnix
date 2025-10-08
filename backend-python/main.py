from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import re
import json
import uuid
from typing import List, Dict, Any
import nltk
from collections import Counter
from datetime import datetime
import random
import string

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

app = FastAPI(title="Simple Advanced MCQ Quiz Generator", version="3.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimpleMCQGenerator:
    def __init__(self):
        # Common academic subjects and their keywords
        self.subject_keywords = {
            'science': ['cell', 'atom', 'molecule', 'energy', 'force', 'reaction', 'organism', 'species', 'theory', 'experiment', 'DNA', 'protein', 'carbon', 'oxygen'],
            'mathematics': ['equation', 'formula', 'calculate', 'solve', 'theorem', 'proof', 'variable', 'function', 'algebra', 'geometry', 'calculus', 'derivative'],
            'history': ['century', 'war', 'revolution', 'empire', 'civilization', 'culture', 'period', 'era', 'ancient', 'medieval', 'dynasty', 'battle'],
            'literature': ['character', 'theme', 'author', 'novel', 'poem', 'narrative', 'symbolism', 'metaphor', 'prose', 'verse', 'plot', 'setting'],
            'technology': ['algorithm', 'data', 'system', 'network', 'software', 'hardware', 'programming', 'digital', 'computer', 'internet', 'database'],
            'business': ['market', 'strategy', 'management', 'profit', 'customer', 'organization', 'process', 'analysis', 'revenue', 'investment']
        }
        
        # Common important terms that often appear in academic texts
        self.important_terms = [
            'process', 'system', 'method', 'theory', 'concept', 'principle', 'factor', 'element', 
            'structure', 'function', 'relationship', 'characteristic', 'property', 'feature',
            'advantage', 'disadvantage', 'effect', 'cause', 'result', 'consequence', 'impact'
        ]
    
    def extract_content(self, text: str) -> Dict[str, Any]:
        """Extract content for question generation"""
        
        print("📖 Analyzing text content...")
        
        # Basic processing
        sentences = nltk.sent_tokenize(text)
        words = nltk.word_tokenize(text.lower())
        
        # Remove stopwords and get meaningful words
        from nltk.corpus import stopwords
        stop_words = set(stopwords.words('english'))
        meaningful_words = [w for w in words if w.isalpha() and len(w) > 3 and w not in stop_words]
        
        # Word frequency analysis
        word_freq = Counter(meaningful_words)
        key_terms = [word for word, freq in word_freq.most_common(30)]
        
        # Extract entities using simple pattern matching
        entities = self._extract_simple_entities(text)
        
        # Find different types of sentences
        definition_sentences = self._find_definition_sentences(sentences)
        comparison_sentences = self._find_comparison_sentences(sentences)
        cause_effect_sentences = self._find_cause_effect_sentences(sentences)
        process_sentences = self._find_process_sentences(sentences)
        factual_sentences = self._find_factual_sentences(sentences)
        
        # Detect subject area
        subject_area = self._detect_subject_area(text)
        
        return {
            'sentences': sentences,
            'key_terms': key_terms,
            'entities': entities,
            'definition_sentences': definition_sentences,
            'comparison_sentences': comparison_sentences,
            'cause_effect_sentences': cause_effect_sentences,
            'process_sentences': process_sentences,
            'factual_sentences': factual_sentences,
            'subject_area': subject_area,
            'text_length': len(text),
            'complexity_score': self._calculate_complexity(sentences, key_terms)
        }
    
    def _extract_simple_entities(self, text: str) -> List[tuple]:
        """Extract entities using simple pattern matching"""
        entities = []
        
        # Find capitalized words/phrases (likely proper nouns)
        capitalized_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'
        matches = re.findall(capitalized_pattern, text)
        
        for match in matches:
            if len(match) > 2 and match not in ['The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'What', 'How', 'Why']:
                entities.append((match, 'ENTITY'))
        
        # Find numbers with units
        number_pattern = r'\d+(?:\.\d+)?\s*(?:percent|%|degrees?|meters?|feet|inches|pounds|kg|grams?|years?|months?|days?|hours?|minutes?|seconds?)'
        number_matches = re.findall(number_pattern, text, re.IGNORECASE)
        
        for match in number_matches:
            entities.append((match, 'QUANTITY'))
        
        # Remove duplicates and limit
        unique_entities = list(set(entities))
        return unique_entities[:20]
    
    def _find_definition_sentences(self, sentences: List[str]) -> List[Dict]:
        """Find sentences that contain definitions"""
        definition_patterns = [
            r'(.+?)\s+is\s+(.+)',
            r'(.+?)\s+are\s+(.+)',
            r'(.+?)\s+means\s+(.+)',
            r'(.+?)\s+refers to\s+(.+)',
            r'(.+?)\s+can be defined as\s+(.+)',
            r'(.+?)\s+is known as\s+(.+)',
            r'(.+?)\s+represents\s+(.+)',
            r'(.+?)\s+involves\s+(.+)'
        ]
        
        definitions = []
        for sentence in sentences:
            for pattern in definition_patterns:
                match = re.search(pattern, sentence, re.IGNORECASE)
                if match and len(match.group(1).split()) <= 6 and len(match.group(2).split()) >= 3:
                    term = match.group(1).strip()
                    definition = match.group(2).strip()
                    
                    # Clean up the term
                    term = re.sub(r'^(The|A|An)\s+', '', term, flags=re.IGNORECASE)
                    
                    definitions.append({
                        'sentence': sentence,
                        'term': term,
                        'definition': definition,
                        'pattern': 'definition'
                    })
                    break
        
        return definitions[:15]
    
    def _find_comparison_sentences(self, sentences: List[str]) -> List[Dict]:
        """Find sentences that make comparisons"""
        comparison_keywords = [
            'different from', 'differs from', 'unlike', 'in contrast to', 'whereas', 'however',
            'on the other hand', 'compared to', 'similar to', 'like', 'than', 'versus', 'vs',
            'while', 'although', 'but', 'conversely'
        ]
        
        comparisons = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for keyword in comparison_keywords:
                if keyword in sentence_lower and len(sentence.split()) > 8:
                    comparisons.append({
                        'sentence': sentence,
                        'comparison_type': keyword,
                        'pattern': 'comparison'
                    })
                    break
        
        return comparisons[:10]
    
    def _find_cause_effect_sentences(self, sentences: List[str]) -> List[Dict]:
        """Find cause and effect relationships"""
        cause_effect_patterns = [
            r'(.+?)\s+causes?\s+(.+)',
            r'(.+?)\s+results? in\s+(.+)',
            r'(.+?)\s+leads? to\s+(.+)',
            r'because of\s+(.+?),\s+(.+)',
            r'due to\s+(.+?),\s+(.+)',
            r'as a result of\s+(.+?),\s+(.+)',
            r'(.+?)\s+produces?\s+(.+)',
            r'(.+?)\s+creates?\s+(.+)'
        ]
        
        cause_effects = []
        for sentence in sentences:
            for pattern in cause_effect_patterns:
                match = re.search(pattern, sentence, re.IGNORECASE)
                if match:
                    cause_effects.append({
                        'sentence': sentence,
                        'cause': match.group(1).strip(),
                        'effect': match.group(2).strip(),
                        'pattern': 'cause_effect'
                    })
                    break
        
        return cause_effects[:10]
    
    def _find_process_sentences(self, sentences: List[str]) -> List[Dict]:
        """Find sentences describing processes or steps"""
        process_keywords = [
            'first', 'second', 'third', 'then', 'next', 'finally', 'after', 'before', 'during',
            'process', 'step', 'stage', 'phase', 'procedure', 'method', 'approach', 'technique'
        ]
        
        processes = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            keyword_count = sum(1 for keyword in process_keywords if keyword in sentence_lower)
            if keyword_count >= 1 and len(sentence.split()) > 6:
                processes.append({
                    'sentence': sentence,
                    'keyword_count': keyword_count,
                    'pattern': 'process'
                })
        
        return sorted(processes, key=lambda x: x['keyword_count'], reverse=True)[:10]
    
    def _find_factual_sentences(self, sentences: List[str]) -> List[Dict]:
        """Find sentences with factual information"""
        factual_sentences = []
        
        for sentence in sentences:
            # Look for sentences with numbers, dates, or specific measurements
            has_number = bool(re.search(r'\d+', sentence))
            has_date = bool(re.search(r'\b\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b', sentence))
            has_percentage = bool(re.search(r'\d+\s*%', sentence))
            
            # Look for factual indicators
            factual_indicators = ['approximately', 'exactly', 'about', 'nearly', 'over', 'under', 'between', 'around']
            has_indicator = any(indicator in sentence.lower() for indicator in factual_indicators)
            
            if (has_number or has_date or has_percentage or has_indicator) and len(sentence.split()) >= 6:
                factual_sentences.append({
                    'sentence': sentence,
                    'has_number': has_number,
                    'has_date': has_date,
                    'has_percentage': has_percentage,
                    'has_indicator': has_indicator,
                    'pattern': 'factual'
                })
        
        return factual_sentences[:15]
    
    def _detect_subject_area(self, text: str) -> str:
        """Detect the subject area of the text"""
        text_lower = text.lower()
        subject_scores = {}
        
        for subject, keywords in self.subject_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            subject_scores[subject] = score
        
        if not subject_scores or max(subject_scores.values()) == 0:
            return 'general'
        
        return max(subject_scores, key=subject_scores.get)
    
    def _calculate_complexity(self, sentences: List[str], key_terms: List[str]) -> float:
        """Calculate text complexity score"""
        if not sentences:
            return 0.0
        
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        term_density = len(key_terms) / len(sentences) if sentences else 0
        
        complexity = (avg_sentence_length * 0.1) + (term_density * 0.5)
        return min(complexity, 10.0)
    
    def generate_mcq_questions(self, content: Dict[str, Any], count: int = 15) -> List[Dict]:
        """Generate MCQ questions from content"""
        
        print(f"🎯 Generating {count} MCQ questions...")
        
        questions = []
        
        # Generate different types of questions
        questions.extend(self._generate_definition_questions(content, max(2, count // 4)))
        questions.extend(self._generate_factual_questions(content, max(2, count // 3)))
        questions.extend(self._generate_application_questions(content, max(1, count // 5)))
        questions.extend(self._generate_analysis_questions(content, max(1, count // 6)))
        questions.extend(self._generate_comparison_questions(content, max(1, count // 8)))
        
        # Shuffle and select best questions
        random.shuffle(questions)
        selected_questions = questions[:count]
        
        # Balance difficulty
        self._balance_difficulty(selected_questions)
        
        print(f"✅ Generated {len(selected_questions)} MCQ questions")
        return selected_questions
    
    def _generate_definition_questions(self, content: Dict[str, Any], count: int) -> List[Dict]:
        """Generate definition-based MCQ questions"""
        questions = []
        definitions = content.get('definition_sentences', [])
        
        for definition in definitions[:count]:
            term = definition['term']
            correct_definition = definition['definition']
            
            # Skip if definition is too long
            if len(correct_definition) > 150:
                continue
            
            question_text = random.choice([
                f"What is {term}?",
                f"Which of the following best defines {term}?",
                f"The term '{term}' refers to:",
                f"How is {term} best described?"
            ])
            
            # Generate distractors
            distractors = self._generate_definition_distractors(correct_definition, content, term)
            
            # Create options
            options = [correct_definition] + distractors[:3]
            random.shuffle(options)
            correct_index = options.index(correct_definition)
            
            question = {
                'id': str(uuid.uuid4()),
                'type': 'multiple_choice',
                'question': question_text,
                'options': options,
                'correct_answer': correct_definition,
                'correct_index': correct_index,
                'explanation': f"According to the text, {term} is defined as: {correct_definition}",
                'difficulty': self._determine_difficulty(term, correct_definition),
                'category': 'definition',
                'source_sentence': definition['sentence'],
                'bloom_level': 'remember'
            }
            
            questions.append(question)
        
        return questions
    
    def _generate_factual_questions(self, content: Dict[str, Any], count: int) -> List[Dict]:
        """Generate fact-based questions"""
        questions = []
        factual_sentences = content.get('factual_sentences', [])
        
        for factual in factual_sentences[:count]:
            sentence = factual['sentence']
            
            # Extract numbers or specific facts
            numbers = re.findall(r'\d+(?:\.\d+)?', sentence)
            percentages = re.findall(r'(\d+(?:\.\d+)?)\s*%', sentence)
            
            if numbers and len(numbers[0]) <= 6:  # Reasonable number size
                number = numbers[0]
                
                # Find context around the number
                context_match = re.search(rf'(\w+(?:\s+\w+){{0,3}})\s+{re.escape(number)}(?:\s+(\w+(?:\s+\w+){{0,3}}))?', sentence)
                if context_match:
                    before_context = context_match.group(1) if context_match.group(1) else ""
                    after_context = context_match.group(2) if context_match.group(2) else ""
                    
                    question_text = f"According to the text, what number is associated with {before_context}?"
                    if after_context:
                        question_text = f"According to the text, how many {after_context} are mentioned in relation to {before_context}?"
                else:
                    question_text = f"What numerical value is mentioned in the text?"
                
                correct_answer = number
                
                # Generate numeric distractors
                try:
                    num_val = float(number)
                    if num_val.is_integer():
                        num_val = int(num_val)
                        distractors = [
                            str(num_val + random.randint(1, 10)),
                            str(num_val - random.randint(1, 5)) if num_val > 5 else str(num_val + 5),
                            str(num_val * 2)
                        ]
                    else:
                        distractors = [
                            f"{num_val + 1.5:.1f}",
                            f"{num_val - 0.5:.1f}" if num_val > 1 else f"{num_val + 2:.1f}",
                            f"{num_val * 2:.1f}"
                        ]
                except:
                    distractors = ["50", "100", "25"]
                
                options = [correct_answer] + distractors[:3]
                random.shuffle(options)
                correct_index = options.index(correct_answer)
                
                question = {
                    'id': str(uuid.uuid4()),
                    'type': 'multiple_choice',
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_answer,
                    'correct_index': correct_index,
                    'explanation': f"The text states that the value is {correct_answer}.",
                    'difficulty': 'easy',
                    'category': 'factual',
                    'source_sentence': sentence,
                    'bloom_level': 'remember'
                }
                
                questions.append(question)
        
        return questions
    
    def _generate_application_questions(self, content: Dict[str, Any], count: int) -> List[Dict]:
        """Generate application-based questions"""
        questions = []
        process_sentences = content.get('process_sentences', [])
        
        for process in process_sentences[:count]:
            sentence = process['sentence']
            
            # Extract key concepts from process sentences
            key_concepts = [term for term in content['key_terms'][:10] if term in sentence.lower()]
            
            if key_concepts:
                concept = key_concepts[0]
                
                question_text = random.choice([
                    f"In which scenario would the concept of {concept} be most applicable?",
                    f"When would you most likely need to understand {concept}?",
                    f"Which situation best demonstrates the use of {concept}?",
                    f"Where would knowledge of {concept} be most valuable?"
                ])
                
                correct_answer = f"In situations involving the process or concept described in the text about {concept}"
                
                distractors = [
                    f"Only in theoretical discussions about {concept}",
                    f"When {concept} is completely irrelevant to the situation",
                    f"In contexts where {concept} has been completely replaced"
                ]
                
                options = [correct_answer] + distractors
                random.shuffle(options)
                correct_index = options.index(correct_answer)
                
                question = {
                    'id': str(uuid.uuid4()),
                    'type': 'multiple_choice',
                    'question': question_text,
                    'options': options,
                    'correct_answer': correct_answer,
                    'correct_index': correct_index,
                    'explanation': f"Based on the text, {concept} would be applicable in the contexts described.",
                    'difficulty': 'medium',
                    'category': 'application',
                    'source_sentence': sentence,
                    'bloom_level': 'apply'
                }
                
                questions.append(question)
        
        return questions
    
    def _generate_analysis_questions(self, content: Dict[str, Any], count: int) -> List[Dict]:
        """Generate analysis-level questions"""
        questions = []
        cause_effects = content.get('cause_effect_sentences', [])
        
        for cause_effect in cause_effects[:count]:
            sentence = cause_effect['sentence']
            
            question_text = random.choice([
                "What can be concluded from the relationship described in the text?",
                "Based on the information provided, what is the most likely outcome?",
                "Which conclusion best follows from the cause-and-effect relationship mentioned?",
                "What does this relationship suggest about the underlying process?"
            ])
            
            correct_answer = "There is a direct causal relationship as described in the source material"
            
            distractors = [
                "The events are completely unrelated to each other",
                "The relationship is purely coincidental with no real connection",
                "The effects occur independently of any causes mentioned"
            ]
            
            options = [correct_answer] + distractors
            random.shuffle(options)
            correct_index = options.index(correct_answer)
            
            question = {
                'id': str(uuid.uuid4()),
                'type': 'multiple_choice',
                'question': question_text,
                'options': options,
                'correct_answer': correct_answer,
                'correct_index': correct_index,
                'explanation': "The text establishes a clear cause-and-effect relationship between the described elements.",
                'difficulty': 'hard',
                'category': 'analysis',
                'source_sentence': sentence,
                'bloom_level': 'analyze'
            }
            
            questions.append(question)
        
        return questions
    
    def _generate_comparison_questions(self, content: Dict[str, Any], count: int) -> List[Dict]:
        """Generate comparison-based questions"""
        questions = []
        comparisons = content.get('comparison_sentences', [])
        
        for comparison in comparisons[:count]:
            sentence = comparison['sentence']
            comparison_type = comparison['comparison_type']
            
            question_text = f"According to the text, what is the main relationship established by the comparison?"
            
            correct_answer = f"The text establishes a comparison using '{comparison_type}' to highlight key differences or similarities"
            
            distractors = [
                "The elements being compared are identical in all respects",
                "No meaningful comparison is made between the concepts",
                "The comparison shows that the concepts are unrelated"
            ]
            
            options = [correct_answer] + distractors
            random.shuffle(options)
            correct_index = options.index(correct_answer)
            
            question = {
                'id': str(uuid.uuid4()),
                'type': 'multiple_choice',
                'question': question_text,
                'options': options,
                'correct_answer': correct_answer,
                'correct_index': correct_index,
                'explanation': f"The text uses '{comparison_type}' to establish a comparative relationship.",
                'difficulty': 'medium',
                'category': 'comparison',
                'source_sentence': sentence,
                'bloom_level': 'understand'
            }
            
            questions.append(question)
        
        return questions
    
    def _generate_definition_distractors(self, correct_definition: str, content: Dict[str, Any], term: str) -> List[str]:
        """Generate plausible wrong definitions"""
        distractors = []
        
        # Get other definitions from content
        other_definitions = [d['definition'] for d in content.get('definition_sentences', [])]
        other_definitions = [d for d in other_definitions if d != correct_definition and len(d) < 100]
        
        if other_definitions:
            distractors.extend(other_definitions[:2])
        
        # Generate contextual distractors based on subject area
        subject = content.get('subject_area', 'general')
        if subject == 'science':
            generic_distractors = [
                "A theoretical concept that has not been proven experimentally",
                "An outdated scientific theory no longer accepted by researchers",
                "A hypothesis that lacks sufficient supporting evidence"
            ]
        elif subject == 'history':
            generic_distractors = [
                "An event that occurred in a different historical period",
                "A cultural practice not mentioned in historical records",
                "A political system that was never actually implemented"
            ]
        elif subject == 'mathematics':
            generic_distractors = [
                "A mathematical operation that is no longer used in modern calculations",
                "A theorem that has been disproven by recent mathematical research",
                "A concept that only applies to theoretical mathematics"
            ]
        else:
            generic_distractors = [
                "A concept not discussed in the source material",
                "An alternative interpretation not supported by the text",
                "A related but distinct concept with different characteristics"
            ]
        
        distractors.extend(generic_distractors)
        return distractors[:3]
    
    def _determine_difficulty(self, term: str, definition: str) -> str:
        """Determine question difficulty based on content complexity"""
        term_length = len(term.split())
        def_length = len(definition.split())
        
        # Check for technical terms
        technical_indicators = ['process', 'system', 'mechanism', 'phenomenon', 'characteristic', 'methodology']
        has_technical = any(indicator in definition.lower() for indicator in technical_indicators)
        
        if term_length <= 2 and def_length <= 12 and not has_technical:
            return 'easy'
        elif term_length <= 4 and def_length <= 25 and not has_technical:
            return 'medium'
        else:
            return 'hard'
    
    def _balance_difficulty(self, questions: List[Dict]) -> None:
        """Ensure balanced difficulty distribution"""
        if len(questions) < 3:
            return
            
        total = len(questions)
        target_easy = max(1, total // 3)
        target_medium = max(1, total // 2)
        
        easy_count = sum(1 for q in questions if q.get('difficulty') == 'easy')
        medium_count = sum(1 for q in questions if q.get('difficulty') == 'medium')
        
        # Adjust if needed
        for question in questions:
            if easy_count < target_easy and question.get('difficulty') != 'easy':
                question['difficulty'] = 'easy'
                easy_count += 1
            elif medium_count < target_medium and question.get('difficulty') not in ['easy', 'medium']:
                question['difficulty'] = 'medium'
                medium_count += 1

# Initialize the generator
mcq_generator = SimpleMCQGenerator()

def extract_text_from_pdf(pdf_content: bytes) -> str:
    """Extract text from PDF content"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
        text = ""
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            page_text = page.extract_text()
            if page_text.strip():  # Only add if there's actual content
                text += page_text + "\n"
        
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload PDF and generate MCQ quiz"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read PDF content
        pdf_content = await file.read()
        print(f"📁 Processing PDF: {file.filename} ({len(pdf_content)} bytes)")
        
        # Extract text
        text = extract_text_from_pdf(pdf_content)
        
        if len(text.strip()) < 150:
            raise HTTPException(status_code=400, detail="PDF content is too short to generate meaningful questions. Please upload a document with more text content.")
        
        print(f"📄 Extracted {len(text)} characters of text")
        
        # Analyze content
        content_analysis = mcq_generator.extract_content(text)
        print(f"🧠 Content analysis complete - Subject: {content_analysis['subject_area']}")
        print(f"📊 Found {len(content_analysis['definition_sentences'])} definitions, {len(content_analysis['factual_sentences'])} factual sentences")
        
        # Generate MCQ questions
        questions = mcq_generator.generate_mcq_questions(content_analysis, 15)
        
        if len(questions) < 3:
            raise HTTPException(status_code=400, detail="Could not generate enough questions from the PDF content. Please try a different document with more structured information.")
        
        # Prepare quiz data
        quiz_data = {
            'questions': questions,
            'metadata': {
                'total_questions': len(questions),
                'difficulty_distribution': {
                    'easy': sum(1 for q in questions if q.get('difficulty') == 'easy'),
                    'medium': sum(1 for q in questions if q.get('difficulty') == 'medium'),
                    'hard': sum(1 for q in questions if q.get('difficulty') == 'hard')
                },
                'question_categories': {
                    'definition': sum(1 for q in questions if q.get('category') == 'definition'),
                    'application': sum(1 for q in questions if q.get('category') == 'application'),
                    'analysis': sum(1 for q in questions if q.get('category') == 'analysis'),
                    'factual': sum(1 for q in questions if q.get('category') == 'factual'),
                    'comparison': sum(1 for q in questions if q.get('category') == 'comparison')
                },
                'bloom_taxonomy': {
                    'remember': sum(1 for q in questions if q.get('bloom_level') == 'remember'),
                    'understand': sum(1 for q in questions if q.get('bloom_level') == 'understand'),
                    'apply': sum(1 for q in questions if q.get('bloom_level') == 'apply'),
                    'analyze': sum(1 for q in questions if q.get('bloom_level') == 'analyze')
                },
                'subject_area': content_analysis['subject_area'],
                'complexity_score': content_analysis['complexity_score'],
                'generated_at': datetime.now().isoformat()
            },
            'file_info': {
                'filename': file.filename,
                'size_bytes': len(pdf_content),
                'text_length': len(text),
                'upload_time': datetime.now().isoformat()
            }
        }
        
        print(f"✅ Generated {len(questions)} MCQ questions")
        print(f"📊 Categories: {quiz_data['metadata']['question_categories']}")
        print(f"🎯 Difficulty: {quiz_data['metadata']['difficulty_distribution']}")
        
        return {
            "success": True,
            "message": f"Successfully generated {len(questions)} MCQ questions from {file.filename}",
            "data": quiz_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Simple Advanced MCQ Quiz Generator API",
        "version": "3.1.0",
        "features": [
            "Multiple Choice Questions from PDF",
            "Content Analysis & Subject Detection",
            "Difficulty Balancing",
            "Multiple Question Categories",
            "Smart Distractor Generation",
            "No Complex Dependencies"
        ],
        "question_types": {
            "definition": "Concept definitions and terminology",
            "factual": "Specific facts and data points",
            "application": "Real-world application scenarios",
            "analysis": "Cause-effect relationships",
            "comparison": "Comparing concepts"
        },
        "endpoints": {
            "POST /upload": "Upload PDF and generate MCQ quiz",
            "GET /health": "Health check endpoint"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.1.0",
        "dependencies": {
            "nltk": True,
            "spacy": False,
            "simple_mode": True
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simple Advanced MCQ Quiz Generator...")
    print("📝 Features: MCQ Generation, Content Analysis, No spaCy dependency")
    print("🎯 Question Types: Definition, Factual, Application, Analysis, Comparison")
    uvicorn.run(app, host="0.0.0.0", port=8000)