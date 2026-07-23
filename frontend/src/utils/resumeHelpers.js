export function flattenScan(scan) {
  return {
    atsScore: scan.atsScore,
    strengths: scan.result?.strengths || [],
    weaknesses: scan.result?.weaknesses || [],
    missingKeywords: scan.result?.missingKeywords || [],
    presentKeywords: scan.result?.presentKeywords || [],
    improvements: scan.result?.improvements || [],
    sectionFeedback: scan.result?.sectionFeedback,
    overallFeedback: scan.result?.overallFeedback,
  };
}