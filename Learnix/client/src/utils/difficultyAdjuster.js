import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 

const db = getFirestore();

export const adjustDifficulty = async (userId, quizId, performanceData) => {
    const userDocRef = doc(db, "users", userId);
    const quizDocRef = doc(db, "quizzes", quizId);

    const userDoc = await getDoc(userDocRef);
    const quizDoc = await getDoc(quizDocRef);

    if (!userDoc.exists() || !quizDoc.exists()) {
        throw new Error("User or Quiz not found");
    }

    const userPerformance = userDoc.data().performance || {};
    const quizDifficulty = quizDoc.data().difficulty || "medium";

    // Adjust difficulty based on performance
    if (performanceData.accuracy > 0.8) {
        quizDifficulty = "hard";
    } else if (performanceData.accuracy < 0.5) {
        quizDifficulty = "easy";
    }

    // Update the quiz difficulty in Firestore
    await setDoc(quizDocRef, { difficulty: quizDifficulty }, { merge: true });

    return quizDifficulty;
};