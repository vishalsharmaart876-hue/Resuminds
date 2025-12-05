// --- 1. Analysis Logic (The "Brain") ---
const analyzeText = (text) => {
    const issues = [];
    let score = 100;

    // Weak Verbs
    const weakVerbs = ['helped', 'worked', 'responsible for', 'handled', 'made'];
    const strongVerbs = ['Collaborated', 'Orchestrated', 'Spearheaded', 'Managed', 'Developed'];
    
    weakVerbs.forEach((verb, index) => {
        if (text.toLowerCase().includes(verb)) {
            score -= 5;
            issues.push({
                id: `weak-verb-${index}`,
                type: 'impact',
                severity: 'medium',
                title: `Weak Action Verb Found: "${verb}"`,
                description: `Using "${verb}" undermines your impact. Use stronger power verbs to showcase leadership.`,
                fix: `Replace "${verb}" with "${strongVerbs[index] || 'Executed'}" or similar.`
            });
        }
    });

    // Pronouns
    const pronouns = [' i ', ' me ', ' my ', ' we '];
    let pronounCount = 0;
    pronouns.forEach(p => {
        if (text.toLowerCase().includes(p)) pronounCount++;
    });
    if (pronounCount > 0) {
        score -= 10;
        issues.push({
            id: 'pronouns',
            type: 'style',
            severity: 'high',
            title: 'First-Person Pronouns Detected',
            description: 'Resumes should be written in implied first person (e.g., "Managed team" instead of "I managed the team").',
            fix: 'Remove instances of "I", "Me", "My", or "We". Start sentences directly with verbs.'
        });
    }

    // Word Count
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 100) {
        score -= 15;
        issues.push({
            id: 'length-short',
            type: 'structure', // grouped into style later
            severity: 'high',
            title: 'Resume is too short',
            description: 'Your content seems sparse. A standard resume should be detailed enough to explain your value.',
            fix: 'Expand on your bullet points using the "Result + Action + Context" formula.'
        });
    }

    // Passive Voice
    if (text.match(/\bwas\b\s+\w+ed\b/i) || text.includes(' by ')) {
        score -= 5;
        issues.push({
            id: 'passive-voice',
            type: 'style',
            severity: 'medium',
            title: 'Passive Voice Detected',
            description: 'Phrases like "was handled" or "done by" obscure your specific contribution.',
            fix: 'Switch to active voice: "Orchestrated the project" instead of "Project was orchestrated by me".'
        });
    }

    // Quantification
    if (!text.match(/\d+/)) {
        score -= 5;
        issues.push({
            id: 'no-numbers',
            type: 'impact',
            severity: 'medium',
            title: 'Lack of Quantification',
            description: 'Your resume lacks numbers or metrics. Recruiters look for data to prove your value.',
            fix: 'Add specific numbers: "Managed team of 5", "Increased sales by 20%", "Reduced load time by 3s".'
        });
    }

    return {
        score: Math.max(0, score),
        issues: issues,
        wordCount: wordCount
    };
};

// --- Helper: Generate Random Resume Text for Simulation ---
function generateMockText() {
    const badSentences = [
        "I was responsible for managing the team.",
        "I helped with the project deliverables.",
        "The project was handled by me entirely.",
        "I worked on sales reports.",
        "Made a new website for the client.",
        "My duties included filing reports and data entry.",
        "I am a hard worker and team player.",
        "Tasks were completed by me on time."
    ];
    
    const goodSentences = [
        "Orchestrated a team of 5 developers to launch the app.",
        "Spearheaded the Q3 marketing initiative, increasing leads by 15%.",
        "Developed a Python script that automated daily tasks.",
        "Managed a budget of $50,000 for the fiscal year.",
        "Collaborated with cross-functional teams to ensure quality.",
        "Reduced load times by 30% through code optimization.",
        "Executed a new sales strategy resulting in 10% growth."
    ];

    // Randomly pick 3-6 bad sentences and 2-4 good ones to create variety
    const randomBadCount = Math.floor(Math.random() * 4) + 1; // 1 to 4 bad sentences
    const randomGoodCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 good sentences
    
    const selectedBad = badSentences.sort(() => 0.5 - Math.random()).slice(0, randomBadCount);
    const selectedGood = goodSentences.sort(() => 0.5 - Math.random()).slice(0, randomGoodCount);
    
    return [...selectedBad, ...selectedGood].sort(() => 0.5 - Math.random()).join(" ");
}

// --- 2. UI Handling ---
let currentResults = null;
let activeTab = 'all';

// File Input Event
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Transition to Analyzing
    document.getElementById('view-upload').classList.add('hidden');
    document.getElementById('view-analyzing').classList.remove('hidden');

    const startDelay = () => {
        setTimeout(() => {
            // Transition to Results
            document.getElementById('view-analyzing').classList.add('hidden');
            document.getElementById('view-results').classList.remove('hidden');
            lucide.createIcons();
        }, 2000);
    };

    // If text file, READ IT REAL
    if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const results = analyzeText(text);
            currentResults = results;
            renderResults(results, file.name);
            startDelay();
        };
        reader.readAsText(file);
    } else {
        // For PDF/DOCX (Simulation), generate RANDOM text so results vary
        const randomText = generateMockText();
        const results = analyzeText(randomText);
        currentResults = results;
        renderResults(results, file.name);
        startDelay();
    }
});

// Helper to update individual rating cards
function updateRatingCard(type, count, isWordCount = false) {
    const textEl = document.getElementById(`rating-text-${type}`);
    const cardEl = document.getElementById(`rating-card-${type}`);
    
    let label = "Great";
    let colorClass = "text-emerald-700";
    let bgClass = "bg-emerald-50";

    if (isWordCount) {
        // Logic for Brevity (Word Count)
        if (count < 50 || count > 1000) {
            label = "Needs Work";
            colorClass = "text-red-700";
            bgClass = "bg-red-50";
        } else if (count < 100) {
            label = "Too Short";
            colorClass = "text-amber-700";
            bgClass = "bg-amber-50";
        } else {
            label = "Great";
        }
    } else {
        // Logic for Issue Counts
        if (count === 0) {
            label = "Great";
        } else if (count <= 2) {
            label = "Medium";
            colorClass = "text-amber-700";
            bgClass = "bg-amber-50";
        } else {
            label = "Needs Work";
            colorClass = "text-red-700";
            bgClass = "bg-red-50";
        }
    }

    textEl.innerText = label;
    textEl.className = `font-semibold ${colorClass}`;
    cardEl.className = `flex-1 md:flex-none text-center p-4 rounded-xl transition-colors ${bgClass}`;
}

function renderResults(results, filename) {
    document.getElementById('score-display').innerText = results.score;
    document.getElementById('filename-display').innerText = `File: ${filename}`;
    document.getElementById('word-count-badge').innerText = `${results.wordCount} words`;
    document.getElementById('issue-count-badge').innerText = `${results.issues.length} issues`;

    // Color ring based on score
    const ring = document.getElementById('score-ring');
    ring.className = `relative flex items-center justify-center w-24 h-24 rounded-full border-8 ${
        results.score >= 80 ? 'border-emerald-500 text-emerald-600' : 
        results.score >= 60 ? 'border-amber-500 text-amber-600' : 'border-red-500 text-red-600'
    }`;

    // Calculate Counts
    const impactCount = results.issues.filter(i => i.type === 'impact').length;
    const styleCount = results.issues.filter(i => i.type === 'style').length;
    
    // Update Text Counts
    document.getElementById('count-all').innerText = results.issues.length;
    document.getElementById('count-impact').innerText = impactCount;
    document.getElementById('count-style').innerText = styleCount;

    // Update Dynamic Rating Cards
    updateRatingCard('impact', impactCount);
    updateRatingCard('style', styleCount);
    updateRatingCard('brevity', results.wordCount, true);

    renderIssuesList();
}

function filterIssues(type) {
    activeTab = type;
    
    // Update Tab Styles
    const tabs = ['all', 'impact', 'style'];
    tabs.forEach(t => {
        const btn = document.getElementById(`btn-${t}`);
        if (t === type) {
            btn.className = "w-full text-left px-4 py-3 rounded-lg flex items-center justify-between mb-1 bg-violet-50 text-violet-700 font-medium transition-colors";
        } else {
            btn.className = "w-full text-left px-4 py-3 rounded-lg flex items-center justify-between mb-1 text-slate-600 hover:bg-slate-50 transition-colors";
        }
    });

    renderIssuesList();
}

function renderIssuesList() {
    const container = document.getElementById('issues-container');
    container.innerHTML = '';
    
    if (!currentResults) return;

    const filtered = currentResults.issues.filter(i => {
        if (activeTab === 'all') return true;
        if (activeTab === 'impact') return i.type === 'impact';
        if (activeTab === 'style') return i.type === 'style' || i.type === 'structure';
        return false;
    });

    if (filtered.length === 0) {
        document.getElementById('no-issues-msg').classList.remove('hidden');
    } else {
        document.getElementById('no-issues-msg').classList.add('hidden');
        
        filtered.forEach(issue => {
            const iconColor = issue.severity === 'high' ? 'text-red-600 bg-red-50' : 
                              issue.severity === 'medium' ? 'text-amber-600 bg-amber-50' : 
                              'text-emerald-600 bg-emerald-50';
            const iconName = issue.severity === 'none' ? 'check-circle' : 'alert-circle';

            const html = `
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                    <div class="p-5">
                        <div class="flex items-start gap-4">
                            <div class="mt-1 p-2 rounded-full flex-shrink-0 ${iconColor}">
                                <i data-lucide="${iconName}" class="w-5 h-5"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-slate-800 text-lg">${issue.title}</h4>
                                <p class="text-slate-600 mt-1 text-sm leading-relaxed">${issue.description}</p>
                                ${issue.fix ? `
                                <div class="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                                        <i data-lucide="sparkles" class="w-3 h-3 text-violet-500"></i> AI Suggestion
                                    </div>
                                    <p class="text-violet-900 font-medium text-sm">${issue.fix}</p>
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });
        
        // Re-initialize icons for new elements
        lucide.createIcons();
    }
}

// Initialize icons on load
lucide.createIcons();