import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, User, BarChart, LogOut, ClipboardList } from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Quiz Data
const QUESTIONS = [
  {
    id: 1,
    question: "In a simulation of DNA mutation, why is it necessary to apply a substitution model (like Jukes-Cantor) rather than simply counting the observed differences?",
    options: [
      "To translate the resulting DNA sequence into a functional protein sequence.",
      "To account for hidden evolutionary events, such as multiple mutations occurring at the same nucleotide site over time.",
      "To determine the exact physical length of the DNA molecule in base pairs.",
      "To predict the secondary structure of the resulting RNA molecule."
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which module in the Biopython library is the standard tool used for reading, writing, and parsing standard sequence file formats like FASTA and GenBank?",
    options: ["Bio.AlignIO", "Bio.PDB", "Bio.SeqIO", "Bio.Phylo"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "When working with Python for numeric analysis, which Pandas data structure is designed to hold two-dimensional, tabular data with heterogeneous data types?",
    options: ["DataFrame", "Series", "NumPy Array", "Dictionary"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "In R data wrangling, which function from the popular tidyverse/dplyr package is used specifically to subset rows based on logical conditions?",
    options: ["select()", "mutate()", "filter()", "group_by()"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "When visualizing data in R using ggplot2, what is the purpose of the `aes()` function?",
    options: [
      "It specifies the geometric shape (like points or lines) to be drawn.",
      "It applies a statistical transformation to the raw data.",
      "It maps variables from the dataset to visual properties of the plot, such as x/y position, color, or size.",
      "It defines the visual theme and background colors of the plot."
    ],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "In a Unix/Linux command-line environment, what does the piping operator (`|`) do?",
    options: [
      "It redirects the output of a command to save it into a new file.",
      "It takes the standard output of one command and passes it as standard input to the next command.",
      "It executes two commands simultaneously in the background.",
      "It searches the file system recursively for files matching a wildcard pattern."
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "Which Unix command-line tool is particularly well-suited for processing and extracting data from columnar text files by referencing specific column numbers?",
    options: ["sed", "grep", "awk", "chmod"],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "Why is installing and managing Conda environments considered a best practice in bioinformatics?",
    options: [
      "It creates isolated spaces that prevent software dependency conflicts between different projects.",
      "It automatically parallelizes single-threaded applications across multiple CPU cores.",
      "It provides unlimited cloud storage for large sequencing datasets.",
      "It automatically generates Python docstrings and comments for undocumented code."
    ],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "During the genome assembly process, overlapping short sequence reads are computationally merged to form longer, continuous sequences without gaps. What are these contiguous sequences called?",
    options: ["K-mers", "Contigs", "Scaffolds", "Plasmids"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Following genome assembly, what is the primary objective of genome annotation?",
    options: [
      "To determine the order of nucleotides in the DNA sample.",
      "To computationally stitch overlapping reads together.",
      "To identify structural features like genes and assign putative biological functions to them.",
      "To extract DNA from an environmental sample."
    ],
    correctAnswer: 2
  },
  {
    id: 11,
    question: "In phylogenetic analysis, what biological concept does an internal node on a phylogenetic tree represent?",
    options: [
      "An extinction event in the lineage.",
      "A lateral gene transfer event between species.",
      "A hypothetical common ancestor of the descendant lineages.",
      "An existing species that has been sequenced."
    ],
    correctAnswer: 2
  },
  {
    id: 12,
    question: "When clustering genes for pan-genome analysis, researchers look for orthologs. Which of the following defines orthologous genes?",
    options: [
      "Genes within the same genome that arose from a recent gene duplication event.",
      "Genes in different species that evolved from a single ancestral gene via a speciation event.",
      "Genes that share similar structural properties due to convergent evolution.",
      "Genes that are exclusively found on mobile genetic elements."
    ],
    correctAnswer: 1
  },
  {
    id: 13,
    question: "In the context of Microbial Pan-Genome Analysis, what does the term 'core genome' refer to?",
    options: [
      "The set of genes present in all or nearly all sequenced strains of a given species.",
      "The set of genes that are unique to only a single strain.",
      "The collection of genes exclusively responsible for virulence and antibiotic resistance.",
      "The entire collection of all genes discovered across all strains of a species."
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    question: "During Mobilome Analysis, Integrative and Conjugative Elements (ICEs) are identified. How do these elements behave in a bacterial population?",
    options: [
      "They remain permanently integrated in the chromosome and can only be passed vertically.",
      "They excise from the host chromosome, transfer to a recipient cell via conjugation, and integrate into the new host's chromosome.",
      "They exist exclusively as free-floating circular DNA that never integrates into the chromosome.",
      "They rely on bacteriophages to physically package and transport them between cells."
    ],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "In variant calling pipelines, researchers often look for SNPs. What does SNP stand for?",
    options: [
      "Structural Nucleotide Placement",
      "Single Nucleotide Polymorphism",
      "Short Non-coding Peptide",
      "Sequence Normalization Protocol"
    ],
    correctAnswer: 1
  },
  {
    id: 16,
    question: "What is the primary advantage of using a tool like Snakemake to automate bioinformatics pipelines?",
    options: [
      "It guarantees that all genome assemblies will be 100% complete and gapless.",
      "It provides a framework to create scalable, reproducible workflows that automatically resolve execution dependencies.",
      "It performs high-accuracy base calling for long-read sequencing technologies.",
      "It visualizes complex phylogenetic networks directly in the terminal."
    ],
    correctAnswer: 1
  },
  {
    id: 17,
    question: "Which of the following best describes the 'shotgun metagenomics' approach?",
    options: [
      "Sequencing a highly conserved marker gene, such as 16S rRNA, from an environmental sample.",
      "Randomly shearing all the DNA present in a microbial community sample and sequencing the fragments.",
      "Isolating a single bacterial cell from an environment and sequencing its entire genome.",
      "Culturing specific bacteria on agar plates before sequencing them."
    ],
    correctAnswer: 1
  },
  {
    id: 18,
    question: "In the analysis of shotgun metagenomics data, researchers often reconstruct MAGs. What is a MAG?",
    options: [
      "Multiple Alignment Graph",
      "Microbial Amplicon Group",
      "Metagenome-Assembled Genome",
      "Metabolic Annotation Guideline"
    ],
    correctAnswer: 2
  },
  {
    id: 19,
    question: "In amplicon sequencing (e.g., 16S rRNA analysis), the data is often used to calculate 'alpha diversity'. What does alpha diversity measure?",
    options: [
      "The diversity or richness of species within a single localized sample or environment.",
      "The difference in microbial composition between two separate environments.",
      "The overall diversity of all ecosystems combined in a large geographical region.",
      "The total number of metabolic pathways present in a microbial community."
    ],
    correctAnswer: 0
  },
  {
    id: 20,
    question: "Which specific gene is heavily utilized in amplicon sequencing to act as a 'molecular clock' and taxonomic identifier for bacterial communities?",
    options: [
      "DNA Polymerase (polA)",
      "Cytochrome c oxidase (COI)",
      "16S ribosomal RNA (16S rRNA)",
      "RNA polymerase subunit B (rpoB)"
    ],
    correctAnswer: 2
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'exam', 'result', 'dashboard'
  const [studentName, setStudentName] = useState('');
  
  // Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard State
  const [allScores, setAllScores] = useState([]);

  // Firebase Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Authentication Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Scores for Dashboard
  useEffect(() => {
    if (!user || view !== 'dashboard') return;

    const scoresRef = collection(db, 'exam_scores');
    
    const unsubscribe = onSnapshot(scoresRef, (snapshot) => {
      const fetchedScores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by timestamp descending (newest first)
      fetchedScores.sort((a, b) => b.timestamp - a.timestamp);
      setAllScores(fetchedScores);
    }, (error) => {
      console.error("Error fetching scores:", error);
    });

    return () => unsubscribe();
  }, [user, view]);

  const handleStartExam = (e) => {
    e.preventDefault();
    if (studentName.trim() === '') return;
    setAnswers({});
    setCurrentQuestionIndex(0);
    setView('exam');
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!user) return;
    setIsSubmitting(true);

    // Calculate Score
    let score = 0;
    QUESTIONS.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    setFinalScore(score);

    // Save to Firestore
    const scoreData = {
      studentName: studentName.trim(),
      score: score,
      total: QUESTIONS.length,
      timestamp: Date.now(),
      userId: user.uid
    };

    try {
      await addDoc(collection(db, 'exam_scores'), scoreData);
      setView('result');
    } catch (error) {
      console.error("Error saving score:", error);
      // In a real app, show an error to the user here. For now, proceed to result anyway.
      setView('result');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Components ---

  const renderLogin = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6 text-indigo-600">
          <ClipboardList size={48} />
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Bioinformatics Fundamentals</h1>
        <p className="text-center text-slate-500 mb-8">Final Examination</p>

        <form onSubmit={handleStartExam} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Student Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                id="name"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="e.g., Jane Doe"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!user || studentName.trim() === ''}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Exam
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => setView('dashboard')}
            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center w-full"
          >
            <BarChart size={16} className="mr-2" />
            Teacher Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const renderExam = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header / Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-semibold text-slate-800">
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </h2>
            <span className="text-sm font-medium text-slate-500">{studentName}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 mb-6">
          <h3 className="text-xl text-slate-800 font-medium mb-6 leading-relaxed">
            {question.question}
          </h3>
          
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 mr-3 flex items-center justify-center ${
                      isSelected ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>
          
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight size={18} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting || Object.keys(answers).length < QUESTIONS.length}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              {!isSubmitting && <CheckCircle size={18} className="ml-2" />}
            </button>
          )}
        </div>
        
        {isLastQuestion && Object.keys(answers).length < QUESTIONS.length && (
          <p className="text-amber-600 text-sm mt-4 text-right flex justify-end items-center">
            Please answer all questions before submitting.
          </p>
        )}
      </div>
    );
  };

  const renderResult = () => {
    const percentage = (finalScore / QUESTIONS.length) * 100;
    let feedback = "";
    if (percentage >= 90) feedback = "Excellent work!";
    else if (percentage >= 70) feedback = "Good job!";
    else feedback = "Keep studying!";

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Exam Submitted</h1>
          <p className="text-lg text-slate-600 mb-6">Thank you, {studentName}.</p>
          
          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
            <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Your Score</p>
            <div className="text-5xl font-extrabold text-indigo-600 mb-2">
              {finalScore} <span className="text-2xl text-slate-400 font-medium">/ {QUESTIONS.length}</span>
            </div>
            <p className="text-lg font-medium text-slate-700">{percentage}% - {feedback}</p>
          </div>

          <button
            onClick={() => {
              setStudentName('');
              setView('login');
            }}
            className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Return to Home
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <BarChart className="mr-2 text-indigo-600" />
            Teacher Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Live overview of student submissions</p>
        </div>
        <button
          onClick={() => setView('login')}
          className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Login
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl border border-slate-200 overflow-hidden">
        {allScores.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ClipboardList size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-700 mb-1">No submissions yet</p>
            <p>Scores will appear here automatically when students finish.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Submission Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {allScores.map((submission) => {
                  const percentage = ((submission.score / submission.total) * 100).toFixed(0);
                  const date = new Date(submission.timestamp);
                  return (
                    <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{submission.studentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-700">
                          {submission.score} / {submission.total}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          percentage >= 90 ? 'bg-green-100 text-green-800' : 
                          percentage >= 70 ? 'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-between text-sm text-slate-500">
        <span>Total Submissions: {allScores.length}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ClipboardList size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">BioInfo Exam Portal</span>
        </div>
      </nav>

      <main className="pb-12">
        {view === 'login' && renderLogin()}
        {view === 'exam' && renderExam()}
        {view === 'result' && renderResult()}
        {view === 'dashboard' && renderDashboard()}
      </main>
    </div>
  );
}
